import "dotenv/config";
import http from "node:http";
import path from "node:path";
import fs from "node:fs";
import express from "express";
import type { Request, Response } from "express";
import { WebSocketServer, WebSocket } from "ws";
import { GoogleGenAI, Modality } from "@google/genai";
import type { LiveServerMessage } from "@google/genai";

const PORT = Number(process.env.PORT) || 3000;
const IS_PRODUCTION = process.env.NODE_ENV === "production";

type VoiceName = "Puck" | "Charon" | "Kore" | "Fenrir" | "Zephyr";

interface InitPayload {
  type: "init";
  mode?: "match" | "wingman";
  voiceName?: VoiceName;
  systemInstruction?: string;
}

interface AudioPayload {
  type: "audio";
  data: string;
}

interface TextPayload {
  type: "text";
  text: string;
}

type ClientMessage = InitPayload | AudioPayload | TextPayload;

const ALLOWED_VOICES: VoiceName[] = ["Puck", "Charon", "Kore", "Fenrir", "Zephyr"];

function createGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in environment secrets.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json());

  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ ok: true, liveModel: "gemini-3.8-live" });
  });

  const server = http.createServer(app);
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (req, socket, head) => {
    const pathname = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`).pathname;
    if (pathname === "/api/live") {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit("connection", ws, req);
      });
    } else if (IS_PRODUCTION) {
      socket.destroy();
    }
  });

  wss.on("connection", (clientWs: WebSocket) => {
    let session: Awaited<ReturnType<GoogleGenAI["live"]["connect"]>> | null = null;
    let isClosing = false;
    let initializing = false;

    const safeSend = (payload: Record<string, unknown>) => {
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify(payload));
      }
    };

    const cleanup = () => {
      if (isClosing) return;
      isClosing = true;
      if (session) {
        try {
          session.close();
        } catch {
          // Ignore close errors if already closed
        }
        session = null;
      }
    };

    clientWs.on("message", async (rawData) => {
      let parsed: ClientMessage;
      try {
        parsed = JSON.parse(rawData.toString()) as ClientMessage;
      } catch {
        safeSend({ type: "error", message: "Invalid JSON payload received by live server." });
        return;
      }

      if (parsed.type === "init") {
        if (session || initializing) return;
        initializing = true;

        try {
          const ai = createGeminiClient();
          const voiceName = ALLOWED_VOICES.includes(parsed.voiceName as VoiceName)
            ? (parsed.voiceName as VoiceName)
            : "Zephyr";

          const systemInstruction =
            parsed.systemInstruction?.trim() ||
            "You are a warm, natural conversationalist in a social dating app. Keep spoken responses concise, engaging, and friendly.";

          session = await ai.live.connect({
            model: "gemini-3.8-live",
            config: {
              responseModalities: [Modality.AUDIO],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName },
                },
              },
              inputAudioTranscription: {},
              outputAudioTranscription: {},
              systemInstruction,
            },
            callbacks: {
              onopen: () => {
                safeSend({ type: "ready" });
              },
              onmessage: (message: LiveServerMessage) => {
                const content = message.serverContent;
                if (!content) return;

                if (content.inputTranscription?.text) {
                  safeSend({
                    type: "inputTranscript",
                    text: content.inputTranscription.text,
                  });
                }

                if (content.outputTranscription?.text) {
                  safeSend({
                    type: "outputTranscript",
                    text: content.outputTranscription.text,
                  });
                }

                for (const part of content.modelTurn?.parts ?? []) {
                  if (part.inlineData?.data) {
                    safeSend({
                      type: "audio",
                      data: part.inlineData.data,
                    });
                  }
                }

                if (content.interrupted) {
                  safeSend({ type: "interrupted" });
                }

                if (content.turnComplete) {
                  safeSend({ type: "turnComplete" });
                }
              },
              onerror: (err: unknown) => {
                const msg = err instanceof Error ? err.message : "Live API connection error.";
                safeSend({ type: "error", message: msg });
                cleanup();
              },
              onclose: () => {
                safeSend({ type: "closed" });
                cleanup();
              },
            },
          });
        } catch (err: unknown) {
          const msg =
            err instanceof Error
              ? err.message
              : "Failed to establish Gemini 3.8 Live session.";
          safeSend({ type: "error", message: msg });
          cleanup();
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.close();
          }
        } finally {
          initializing = false;
        }
        return;
      }

      if (!session) return;

      if (parsed.type === "audio" && parsed.data) {
        try {
          session.sendRealtimeInput({
            audio: { data: parsed.data, mimeType: "audio/pcm;rate=16000" },
          });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Failed to send audio input.";
          safeSend({ type: "error", message: msg });
        }
        return;
      }

      if (parsed.type === "text" && parsed.text?.trim()) {
        try {
          session.sendRealtimeInput({ text: parsed.text.trim() });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Failed to send text cue.";
          safeSend({ type: "error", message: msg });
        }
      }
    });

    clientWs.on("close", cleanup);
    clientWs.on("error", cleanup);
  });

  if (!IS_PRODUCTION) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== "true",
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), "dist");
    app.use(express.static(distDir));
    app.get("*", (_req: Request, res: Response) => {
      const indexFile = path.join(distDir, "index.html");
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send("Build artifacts not found. Run npm run build first.");
      }
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Grindr Proximity server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Server failed to start:", err);
  process.exit(1);
});
