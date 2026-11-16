import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Flame,
  Images,
  MapPin,
  PhoneCall,
  Send,
} from "lucide-react";
import type { Conversation, UserProfile } from "../types/app";
import { PortraitImage } from "./PortraitImage";

interface ChatViewProps {
  user: UserProfile;
  conversation: Conversation | undefined;
  isTyping: boolean;
  onBack: () => void;
  onOpenProfile: (userId: number) => void;
  onSendMessage: (userId: number, text: string) => void;
  onSendLocation: (userId: number) => void;
  onRequestAlbum: () => void;
  onStartVoiceCall: (user: UserProfile) => void;
}

export function ChatView({
  user,
  conversation,
  isTyping,
  onBack,
  onOpenProfile,
  onSendMessage,
  onSendLocation,
  onRequestAlbum,
  onStartVoiceCall,
}: ChatViewProps) {
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const messages = conversation?.messages ?? [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = draft.trim();
    if (!clean) return;
    setDraft("");
    onSendMessage(user.id, clean);
  };

  return (
    <div className="flex flex-col h-full bg-[#0E0E10] text-zinc-100">
      {/* Chat Header */}
      <div className="bg-[#17171B] border-b border-zinc-800/90 px-3 py-2.5 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-300 hover:text-white hover:bg-[#222228] transition shrink-0 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => onOpenProfile(user.id)}
            className="flex items-center gap-2.5 text-left min-w-0 cursor-pointer"
          >
            <div className="relative shrink-0">
              <PortraitImage
                src={user.img}
                alt={user.name}
                name={user.name}
                className="w-9 h-9 rounded-full object-cover"
              />
              <span
                className={`w-2.5 h-2.5 rounded-full border-2 border-[#17171B] absolute bottom-0 right-0 ${
                  user.online ? "bg-[#22C55E]" : "bg-zinc-500"
                }`}
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-white truncate">{user.name}</span>
                <span className="text-xs font-mono tabular-nums text-[#F5C518] font-semibold shrink-0">
                  {user.distance}
                </span>
              </div>
              <span className="text-[11px] text-zinc-400 block truncate">
                {user.online ? "Online now" : `Last seen ${user.lastSeen || "recently"}`}
              </span>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onStartVoiceCall(user)}
            aria-label={`Start live voice call with ${user.name}`}
            title="Live Voice Call"
            className="min-h-[40px] px-3 py-1.5 rounded-xl bg-[#F5C518] hover:bg-[#E0B20F] text-black font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Voice</span>
          </button>

          <button
            type="button"
            onClick={() => onSendLocation(user.id)}
            aria-label="Share location pin"
            title="Share Location Pin"
            className="w-10 h-10 rounded-xl text-zinc-400 hover:text-[#F5C518] hover:bg-[#222228] flex items-center justify-center transition cursor-pointer"
          >
            <MapPin className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onRequestAlbum}
            aria-label="Request private album"
            title="Request Private Album"
            className="w-10 h-10 rounded-xl text-zinc-400 hover:text-[#F5C518] hover:bg-[#222228] flex items-center justify-center transition cursor-pointer"
          >
            <Images className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Feed */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-14 px-4 space-y-3">
            <p className="text-xs text-zinc-400">
              Start a conversation with <span className="text-white font-semibold">{user.name}</span> or jump on a live voice call.
            </p>
            <button
              type="button"
              onClick={() => onStartVoiceCall(user)}
              className="min-h-[40px] px-4 py-2 rounded-xl bg-[#17171B] hover:bg-[#222228] border border-zinc-800 text-xs font-semibold text-[#F5C518] inline-flex items-center gap-2 transition cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              Start Live Voice Call
            </button>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender === "me";

            if (msg.kind === "location") {
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                >
                  <div className="max-w-[78%] rounded-2xl overflow-hidden border border-zinc-800 bg-[#17171B]">
                    <div className="h-20 w-52 bg-zinc-900 flex items-center justify-center relative">
                      <MapPin className="w-7 h-7 text-[#F5C518]" />
                      <span className="absolute bottom-1.5 right-2 text-[10px] font-mono bg-black/75 px-1.5 py-0.5 rounded text-zinc-300">
                        {user.distance}
                      </span>
                    </div>
                    <div className="p-2.5 text-xs font-semibold text-white flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#F5C518]" />
                      <span>Shared Location Pin</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono tabular-nums text-zinc-500 mt-1 px-1">
                    {msg.time}
                  </span>
                </div>
              );
            }

            if (msg.kind === "voice_log") {
              return (
                <div key={msg.id} className="flex justify-center py-1">
                  <div className="px-3 py-1.5 rounded-lg bg-[#17171B] border border-zinc-800/80 text-[11px] text-zinc-400 flex items-center gap-2">
                    <PhoneCall className="w-3 h-3 text-[#F5C518]" />
                    <span>{msg.text}</span>
                    <span className="text-zinc-600">·</span>
                    <span className="font-mono tabular-nums">{msg.time}</span>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.kind === "tap"
                      ? "bg-[#F5C518]/15 border border-[#F5C518]/40 text-[#F5C518] font-semibold inline-flex items-center gap-1.5"
                      : isMe
                      ? "bg-[#F5C518] text-black font-medium rounded-br-sm"
                      : "bg-[#17171B] border border-zinc-800/80 text-zinc-100 rounded-bl-sm"
                  }`}
                >
                  {msg.kind === "tap" && <Flame className="w-4 h-4 shrink-0" />}
                  <span>{msg.text}</span>
                </div>
                <span className="text-[10px] font-mono tabular-nums text-zinc-500 mt-1 px-1">
                  {msg.time}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Typing Indicator */}
      {isTyping && (
        <div className="px-4 py-1.5 text-xs text-zinc-400 italic flex items-center gap-1.5 shrink-0">
          <span className="w-1.5 h-1.5 bg-[#F5C518] rounded-full animate-bounce" />
          <span
            className="w-1.5 h-1.5 bg-[#F5C518] rounded-full animate-bounce"
            style={{ animationDelay: "0.15s" }}
          />
          <span
            className="w-1.5 h-1.5 bg-[#F5C518] rounded-full animate-bounce"
            style={{ animationDelay: "0.3s" }}
          />
          <span className="ml-1">{user.name} is typing...</span>
        </div>
      )}

      {/* Composer */}
      <form
        onSubmit={handleSubmit}
        className="bg-[#17171B] border-t border-zinc-800/90 p-3 flex items-center gap-2 shrink-0"
      >
        <button
          type="button"
          onClick={() => onSendMessage(user.id, "🔥")}
          aria-label="Send fire emoji"
          className="w-10 h-10 rounded-full bg-[#222228] hover:bg-zinc-700 text-base flex items-center justify-center transition cursor-pointer shrink-0"
        >
          🔥
        </button>
        <button
          type="button"
          onClick={() => onSendMessage(user.id, "👋")}
          aria-label="Send wave emoji"
          className="w-10 h-10 rounded-full bg-[#222228] hover:bg-zinc-700 text-base flex items-center justify-center transition cursor-pointer shrink-0"
        >
          👋
        </button>

        <div className="flex-1 flex items-center bg-[#0E0E10] rounded-full px-3.5 py-1 border border-zinc-800 focus-within:border-[#F5C518] transition">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type a message..."
            className="bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none w-full min-h-[36px]"
          />
        </div>

        <button
          type="submit"
          aria-label="Send message"
          className="w-11 h-11 rounded-full bg-[#F5C518] hover:bg-[#E0B20F] text-black flex items-center justify-center font-bold transition active:scale-95 cursor-pointer shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
