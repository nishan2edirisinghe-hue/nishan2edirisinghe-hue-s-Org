import { useCallback, useEffect, useRef, useState } from "react";
import type { VoiceName } from "../types/app";

export type LiveVoiceStatus = "idle" | "connecting" | "active" | "error";

export interface TranscriptEntry {
  id: string;
  speaker: "you" | "ai";
  text: string;
}

interface StartLiveOptions {
  mode: "match" | "wingman";
  voiceName: VoiceName;
  systemInstruction: string;
}

function downsampleTo16k(input: Float32Array, inputSampleRate: number): Float32Array {
  if (inputSampleRate === 16000) return input;
  const ratio = inputSampleRate / 16000;
  const newLength = Math.max(1, Math.round(input.length / ratio));
  const result = new Float32Array(newLength);
  let offsetResult = 0;
  let offsetBuffer = 0;
  while (offsetResult < result.length) {
    const nextOffsetBuffer = Math.round((offsetResult + 1) * ratio);
    let accum = 0;
    let count = 0;
    for (let i = offsetBuffer; i < nextOffsetBuffer && i < input.length; i++) {
      accum += input[i];
      count++;
    }
    result[offsetResult] = count > 0 ? accum / count : 0;
    offsetResult++;
    offsetBuffer = nextOffsetBuffer;
  }
  return result;
}

function float32ToBase64Pcm16(samples: Float32Array): string {
  const pcm16 = new Int16Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  const bytes = new Uint8Array(pcm16.buffer);
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const slice = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...slice);
  }
  return btoa(binary);
}

function base64Pcm16ToFloat32(base64: string): Float32Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const pcm16 = new Int16Array(bytes.buffer);
  const float32 = new Float32Array(pcm16.length);
  for (let i = 0; i < pcm16.length; i++) {
    float32[i] = pcm16[i] / 0x8000;
  }
  return float32;
}

export function useGeminiLiveVoice() {
  const [status, setStatus] = useState<LiveVoiceStatus>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const inputCtxRef = useRef<AudioContext | null>(null);
  const outputCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const isMutedRef = useRef<boolean>(false);
  const isReadyRef = useRef<boolean>(false);
  const timerRef = useRef<number | null>(null);

  const clearScheduledAudio = useCallback(() => {
    for (const source of activeSourcesRef.current) {
      try {
        source.stop();
      } catch {
        // Ignore already stopped sources
      }
    }
    activeSourcesRef.current.clear();
    nextStartTimeRef.current = 0;
    setIsModelSpeaking(false);
  }, []);

  const appendTranscript = useCallback((speaker: "you" | "ai", chunkText: string) => {
    if (!chunkText) return;
    setTranscripts((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.speaker === speaker) {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...last,
          text: `${last.text}${chunkText}`,
        };
        return updated;
      }
      return [
        ...prev,
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          speaker,
          text: chunkText,
        },
      ];
    });
  }, []);

  const stopSession = useCallback(() => {
    isReadyRef.current = false;

    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (processorRef.current) {
      try {
        processorRef.current.disconnect();
      } catch {
        // Ignore disconnect error
      }
      processorRef.current.onaudioprocess = null;
      processorRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (inputCtxRef.current) {
      inputCtxRef.current.close().catch(() => undefined);
      inputCtxRef.current = null;
    }

    clearScheduledAudio();

    if (outputCtxRef.current) {
      outputCtxRef.current.close().catch(() => undefined);
      outputCtxRef.current = null;
    }

    if (wsRef.current) {
      if (
        wsRef.current.readyState === WebSocket.OPEN ||
        wsRef.current.readyState === WebSocket.CONNECTING
      ) {
        wsRef.current.close();
      }
      wsRef.current = null;
    }

    setAudioLevel(0);
    setIsModelSpeaking(false);
    setStatus("idle");
  }, [clearScheduledAudio]);

  const startSession = useCallback(
    async (options: StartLiveOptions) => {
      stopSession();
      setErrorMessage(null);
      setTranscripts([]);
      setDurationSeconds(0);
      setIsMuted(false);
      isMutedRef.current = false;
      setStatus("connecting");

      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("Microphone access is not supported in this browser.");
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        streamRef.current = stream;

        const inputCtx = new AudioContext({ sampleRate: 16000 });
        inputCtxRef.current = inputCtx;
        if (inputCtx.state === "suspended") {
          await inputCtx.resume();
        }

        const outputCtx = new AudioContext({ sampleRate: 24000 });
        outputCtxRef.current = outputCtx;
        if (outputCtx.state === "suspended") {
          await outputCtx.resume();
        }

        const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const ws = new WebSocket(`${wsProtocol}//${window.location.host}/api/live`);
        wsRef.current = ws;

        const source = inputCtx.createMediaStreamSource(stream);
        const processor = inputCtx.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;

        // Keep mic graph silent on local speakers while processing PCM frames
        const silentGain = inputCtx.createGain();
        silentGain.gain.value = 0;
        source.connect(processor);
        processor.connect(silentGain);
        silentGain.connect(inputCtx.destination);

        processor.onaudioprocess = (e) => {
          if (
            !isReadyRef.current ||
            isMutedRef.current ||
            !wsRef.current ||
            wsRef.current.readyState !== WebSocket.OPEN
          ) {
            if (isMutedRef.current) setAudioLevel(0);
            return;
          }
          const rawChannel = e.inputBuffer.getChannelData(0);
          let sumSq = 0;
          for (let i = 0; i < rawChannel.length; i++) {
            sumSq += rawChannel[i] * rawChannel[i];
          }
          const rms = Math.sqrt(sumSq / rawChannel.length);
          setAudioLevel((prev) => Math.max(Math.min(1, rms * 5.5), prev * 0.6));

          const samples16k = downsampleTo16k(rawChannel, inputCtx.sampleRate);
          const base64Audio = float32ToBase64Pcm16(samples16k);
          wsRef.current.send(JSON.stringify({ type: "audio", data: base64Audio }));
        };

        ws.onopen = () => {
          ws.send(
            JSON.stringify({
              type: "init",
              mode: options.mode,
              voiceName: options.voiceName,
              systemInstruction: options.systemInstruction,
            })
          );
        };

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data as string) as {
              type: string;
              data?: string;
              text?: string;
              message?: string;
            };

            if (msg.type === "ready") {
              isReadyRef.current = true;
              setStatus("active");
              timerRef.current = window.setInterval(() => {
                setDurationSeconds((s) => s + 1);
              }, 1000);
              return;
            }

            if (msg.type === "audio" && msg.data && outputCtxRef.current) {
              const ctx = outputCtxRef.current;
              const samples = base64Pcm16ToFloat32(msg.data);
              const buffer = ctx.createBuffer(1, samples.length, 24000);
              buffer.copyToChannel(new Float32Array(samples), 0);

              const bufferSource = ctx.createBufferSource();
              bufferSource.buffer = buffer;
              bufferSource.connect(ctx.destination);

              const startAt = Math.max(ctx.currentTime, nextStartTimeRef.current);
              bufferSource.start(startAt);
              nextStartTimeRef.current = startAt + buffer.duration;

              activeSourcesRef.current.add(bufferSource);
              setIsModelSpeaking(true);

              let sumSq = 0;
              for (let i = 0; i < samples.length; i += 8) {
                sumSq += samples[i] * samples[i];
              }
              const rms = Math.sqrt(sumSq / Math.max(1, samples.length / 8));
              setAudioLevel((prev) => Math.max(Math.min(1, rms * 4.5), prev * 0.5));

              bufferSource.onended = () => {
                activeSourcesRef.current.delete(bufferSource);
                if (activeSourcesRef.current.size === 0) {
                  setIsModelSpeaking(false);
                }
              };
              return;
            }

            if (msg.type === "inputTranscript" && msg.text) {
              appendTranscript("you", msg.text);
              return;
            }

            if (msg.type === "outputTranscript" && msg.text) {
              appendTranscript("ai", msg.text);
              return;
            }

            if (msg.type === "interrupted") {
              clearScheduledAudio();
              return;
            }

            if (msg.type === "error") {
              setErrorMessage(msg.message || "Voice connection encountered an error.");
              setStatus("error");
            }
          } catch {
            // Ignore malformed socket frames
          }
        };

        ws.onerror = () => {
          setErrorMessage("Could not connect to the real-time voice server.");
          setStatus("error");
        };

        ws.onclose = () => {
          isReadyRef.current = false;
          if (timerRef.current !== null) {
            window.clearInterval(timerRef.current);
            timerRef.current = null;
          }
        };
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : "Unable to start microphone for voice call.";
        setErrorMessage(msg);
        setStatus("error");
      }
    },
    [appendTranscript, clearScheduledAudio, stopSession]
  );

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      isMutedRef.current = next;
      return next;
    });
  }, []);

  const sendTextCue = useCallback((text: string) => {
    if (!text.trim()) return;
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && isReadyRef.current) {
      wsRef.current.send(JSON.stringify({ type: "text", text: text.trim() }));
      appendTranscript("you", text.trim());
    }
  }, [appendTranscript]);

  useEffect(() => {
    return () => {
      stopSession();
    };
  }, [stopSession]);

  return {
    status,
    isMuted,
    isModelSpeaking,
    audioLevel,
    durationSeconds,
    transcripts,
    errorMessage,
    startSession,
    stopSession,
    toggleMute,
    sendTextCue,
  };
}
