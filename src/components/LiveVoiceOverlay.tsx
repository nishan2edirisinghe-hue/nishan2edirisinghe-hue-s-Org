import { useEffect, useMemo, useRef } from "react";
import {
  Mic,
  MicOff,
  PhoneOff,
  RefreshCw,
  Sparkles,
  Volume2,
  X,
} from "lucide-react";
import { useGeminiLiveVoice } from "../hooks/useGeminiLiveVoice";
import type {
  Conversation,
  CurrentUserProfile,
  LiveVoiceSessionTarget,
  UserProfile,
} from "../types/app";
import { PortraitImage } from "./PortraitImage";

interface LiveVoiceOverlayProps {
  target: LiveVoiceSessionTarget;
  currentCity: string;
  myProfile: CurrentUserProfile;
  nearbyUsers: UserProfile[];
  conversations: Conversation[];
  onClose: (callSummary?: { userId: number; durationSeconds: number }) => void;
}

function formatTimer(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function LiveVoiceOverlay({
  target,
  currentCity,
  myProfile,
  nearbyUsers,
  conversations,
  onClose,
}: LiveVoiceOverlayProps) {
  const {
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
  } = useGeminiLiveVoice();

  const transcriptEndRef = useRef<HTMLDivElement | null>(null);
  const startedRef = useRef(false);

  const sessionConfig = useMemo(() => {
    if (target.mode === "match") {
      const u = target.user;
      const conv = conversations.find((c) => c.userId === u.id);
      const recentChat = (conv?.messages ?? [])
        .slice(-5)
        .map((m) => `${m.sender === "me" ? myProfile.displayName : u.name}: ${m.text}`)
        .join("\n");

      const systemInstruction = [
        `You are roleplaying as ${u.name}, a ${u.age}-year-old guy on a social dating app currently ${u.distance} away in ${currentCity}.`,
        `Your headline is "${u.headline}". Bio: "${u.bio}".`,
        `Your tribe is ${u.tribe}, body type ${u.body}, interests: ${u.tags.join(", ")}, looking for: ${u.looking}.`,
        `You are talking on a live voice call with ${myProfile.displayName} (headline: "${myProfile.headline}").`,
        recentChat ? `Recent text messages between you two:\n${recentChat}` : "",
        "Speak naturally, warmly, and casually like a real person on a quick voice call—keep turns conversational and concise (1–3 sentences).",
      ]
        .filter(Boolean)
        .join("\n\n");

      return {
        mode: "match" as const,
        voiceName: u.voiceName,
        systemInstruction,
        title: u.name,
        subtitle: `${u.age} · ${u.distance} away · Live Voice`,
      };
    }

    const nearbySnapshot = nearbyUsers
      .slice(0, 6)
      .map(
        (u) =>
          `${u.name} (${u.age}, ${u.distance}, ${u.tribe}, ${u.online ? "online" : "offline"}, "${u.headline}")`
      )
      .join("; ");

    const systemInstruction = [
      `You are the Voice Wingman inside a social dating app for ${myProfile.displayName} (${myProfile.age}, ${myProfile.tribe}) in ${currentCity}.`,
      `Current nearby matches: ${nearbySnapshot}.`,
      "Help the user brainstorm charismatic icebreakers, suggest who fits their mood, or recommend casual meetup spots in the active city.",
      "Keep spoken replies punchy, witty, supportive, and natural (1–3 sentences per turn).",
    ].join("\n\n");

    return {
      mode: "wingman" as const,
      voiceName: "Zephyr" as const,
      systemInstruction,
      title: "Voice Wingman",
      subtitle: `${currentCity} · Real-time dating & icebreaker coach`,
    };
  }, [conversations, currentCity, myProfile, nearbyUsers, target]);

  useEffect(() => {
    if (!startedRef.current) {
      startedRef.current = true;
      startSession({
        mode: sessionConfig.mode,
        voiceName: sessionConfig.voiceName,
        systemInstruction: sessionConfig.systemInstruction,
      });
    }
  }, [sessionConfig, startSession]);

  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [transcripts.length]);

  const handleEndCall = () => {
    const finalSeconds = durationSeconds;
    stopSession();
    if (target.mode === "match" && finalSeconds > 0) {
      onClose({ userId: target.user.id, durationSeconds: finalSeconds });
    } else {
      onClose();
    }
  };

  const handleRetry = () => {
    startSession({
      mode: sessionConfig.mode,
      voiceName: sessionConfig.voiceName,
      systemInstruction: sessionConfig.systemInstruction,
    });
  };

  const bars = [0.45, 0.75, 1, 0.85, 0.55, 0.9, 0.6];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-0 sm:p-4">
      <div className="w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-md bg-[#121216] sm:border sm:border-zinc-800 sm:rounded-3xl flex flex-col justify-between overflow-hidden shadow-2xl">
        {/* Top Bar */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-zinc-800/80">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#F5C518]">
                {target.mode === "match" ? "Live Voice Call" : "Voice Wingman"}
              </span>
              <span className="text-zinc-600">·</span>
              <span className="text-xs font-mono tabular-nums text-zinc-400">
                {status === "active"
                  ? formatTimer(durationSeconds)
                  : status === "connecting"
                  ? "Connecting..."
                  : status === "error"
                  ? "Disconnected"
                  : "Ready"}
              </span>
            </div>
            <p className="text-xs text-zinc-400 truncate mt-0.5">{sessionConfig.subtitle}</p>
          </div>

          <button
            type="button"
            onClick={handleEndCall}
            aria-label="Close voice overlay"
            className="w-10 h-10 rounded-full bg-[#1E1E24] hover:bg-zinc-700 text-zinc-300 flex items-center justify-center transition cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Center Avatar & Live Waveform */}
        <div className="px-6 py-6 flex flex-col items-center text-center">
          <div className="relative">
            <div
              className="w-28 h-28 rounded-full p-1 transition-transform duration-150 border-2 border-[#F5C518]"
              style={{
                transform: `scale(${1 + Math.min(0.14, audioLevel * 0.14)})`,
              }}
            >
              {target.mode === "match" ? (
                <PortraitImage
                  src={target.user.img}
                  alt={target.user.name}
                  name={target.user.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-[#F5C518] to-amber-600 text-black flex items-center justify-center">
                  <Sparkles className="w-10 h-10" />
                </div>
              )}
            </div>
          </div>

          <h2 className="mt-4 text-xl font-extrabold text-white">{sessionConfig.title}</h2>
          <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5">
            {status === "connecting" && "Opening low-latency audio stream..."}
            {status === "active" && (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#F5C518]" />
                <span>
                  {isModelSpeaking
                    ? `${sessionConfig.title} is speaking`
                    : isMuted
                    ? "Microphone muted"
                    : "Listening — speak naturally"}
                </span>
              </>
            )}
            {status === "error" && (
              <span className="text-red-400">{errorMessage || "Voice call failed"}</span>
            )}
          </p>

          {/* Live Audio Level Bars */}
          <div className="mt-5 h-10 flex items-center justify-center gap-1.5" aria-hidden="true">
            {bars.map((weight, idx) => {
              const activeHeight =
                status === "active"
                  ? Math.max(8, Math.round(10 + audioLevel * 28 * weight))
                  : 8;
              return (
                <span
                  key={idx}
                  className={`w-1.5 rounded-full transition-all duration-100 ${
                    status === "active" ? "bg-[#F5C518]" : "bg-zinc-700"
                  }`}
                  style={{ height: `${activeHeight}px` }}
                />
              );
            })}
          </div>

          {/* Wingman Quick Cues */}
          {target.mode === "wingman" && status === "active" && (
            <div className="mt-4 flex flex-wrap justify-center gap-1.5">
              {[
                "Who is closest right now?",
                "Give me an opener for Liam",
                "Plan a coffee meetup",
              ].map((cue) => (
                <button
                  key={cue}
                  type="button"
                  onClick={() => sendTextCue(cue)}
                  className="min-h-[34px] px-3 py-1.5 rounded-lg bg-[#1E1E24] hover:bg-[#2A2A32] border border-zinc-800 text-[11px] font-medium text-zinc-200 transition cursor-pointer"
                >
                  {cue}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Live Transcripts Box */}
        <div className="mx-5 mb-4 flex-1 min-h-[120px] max-h-48 overflow-y-auto rounded-2xl bg-[#0E0E10] border border-zinc-800/90 p-3.5 space-y-2.5">
          {transcripts.length === 0 ? (
            <p className="text-xs text-zinc-500 text-center py-6">
              {status === "error"
                ? "Check microphone permission or Gemini API secret and tap Retry."
                : "Live speech captions will appear here as you talk."}
            </p>
          ) : (
            transcripts.map((entry) => (
              <div key={entry.id} className="text-xs leading-relaxed">
                <span
                  className={`font-bold mr-1.5 ${
                    entry.speaker === "you" ? "text-zinc-400" : "text-[#F5C518]"
                  }`}
                >
                  {entry.speaker === "you" ? "You:" : `${sessionConfig.title}:`}
                </span>
                <span className="text-zinc-200">{entry.text}</span>
              </div>
            ))
          )}
          <div ref={transcriptEndRef} />
        </div>

        {/* Call Controls */}
        <div className="px-6 py-5 bg-[#17171B] border-t border-zinc-800/90 flex items-center justify-center gap-5">
          <button
            type="button"
            onClick={toggleMute}
            disabled={status !== "active"}
            aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
            className={`w-14 h-14 rounded-full flex items-center justify-center border transition cursor-pointer disabled:opacity-40 ${
              isMuted
                ? "bg-zinc-200 text-black border-white"
                : "bg-[#222228] hover:bg-zinc-700 text-white border-zinc-700"
            }`}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {status === "error" && (
            <button
              type="button"
              onClick={handleRetry}
              aria-label="Retry voice call"
              className="w-14 h-14 rounded-full bg-[#F5C518] hover:bg-[#E0B20F] text-black flex items-center justify-center transition cursor-pointer"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          )}

          <button
            type="button"
            onClick={handleEndCall}
            aria-label="End voice call"
            className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center transition active:scale-95 cursor-pointer shadow-lg"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
