import { useState } from "react";
import {
  BadgeCheck,
  ChevronDown,
  Flame,
  MessageCircle,
  Music,
  PhoneCall,
  Send,
  Share2,
  Star,
} from "lucide-react";
import type { UserProfile } from "../types/app";
import { PortraitImage } from "./PortraitImage";

interface ProfileDetailViewProps {
  user: UserProfile;
  isModal?: boolean;
  onClose: () => void;
  onToggleFavorite: (userId: number) => void;
  onSendTap: (userId: number) => void;
  onStartChat: (userId: number, initialMessage?: string) => void;
  onStartVoiceCall: (user: UserProfile) => void;
  onShareLink: (user: UserProfile) => void;
}

export function ProfileDetailView({
  user,
  isModal = false,
  onClose,
  onToggleFavorite,
  onSendTap,
  onStartChat,
  onStartVoiceCall,
  onShareLink,
}: ProfileDetailViewProps) {
  const [quickMessage, setQuickMessage] = useState("");
  const [tappedPulse, setTappedPulse] = useState(false);

  const handleTap = () => {
    setTappedPulse(true);
    onSendTap(user.id);
    window.setTimeout(() => setTappedPulse(false), 600);
  };

  const handleQuickSend = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = quickMessage.trim();
    setQuickMessage("");
    onStartChat(user.id, trimmed || undefined);
  };

  return (
    <div className="flex flex-col h-full bg-[#0E0E10] text-zinc-100 overflow-y-auto">
      {/* Top Floating Bar */}
      <div className="sticky top-0 z-20 flex items-center justify-between p-3 bg-gradient-to-b from-black/85 via-black/40 to-transparent">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close profile"
          className="w-11 h-11 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/85 transition cursor-pointer"
        >
          <ChevronDown className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onToggleFavorite(user.id)}
            aria-label={user.favorite ? "Remove from favorites" : "Add to favorites"}
            className="w-11 h-11 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/85 transition cursor-pointer"
          >
            <Star
              className={`w-5 h-5 ${
                user.favorite ? "text-[#F5C518] fill-[#F5C518]" : "text-white"
              }`}
            />
          </button>
          <button
            type="button"
            onClick={() => onShareLink(user)}
            aria-label="Copy profile link"
            className="w-11 h-11 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/85 transition cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hero Portrait */}
      <div className={`relative -mt-16 w-full ${isModal ? "aspect-[3/4]" : "aspect-[4/4.3]"} bg-zinc-900 shrink-0`}>
        <PortraitImage
          src={user.img}
          alt={`${user.name}, ${user.age}`}
          name={user.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E10] via-black/25 to-transparent" />

        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-2 text-xs mb-1">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                user.online ? "bg-[#22C55E]" : "bg-zinc-500"
              }`}
            />
            <span className={user.online ? "font-semibold text-[#22C55E]" : "font-medium text-zinc-400"}>
              {user.online ? "Online now" : `Offline · ${user.lastSeen || "recently"}`}
            </span>
            <span className="text-zinc-500">·</span>
            <span className="font-mono tabular-nums font-semibold text-[#F5C518]">
              {user.distance} away
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <h2 className="text-2xl font-extrabold text-white">{user.name}</h2>
            <span className="text-xl font-mono tabular-nums text-zinc-300">{user.age}</span>
            {user.verified && (
              <BadgeCheck className="w-4 h-4 text-sky-400 self-center" aria-label="Verified profile" />
            )}
          </div>

          <p className="text-sm text-zinc-200 mt-1 font-medium">“{user.headline}”</p>
        </div>
      </div>

      {/* Profile Content */}
      <div className="px-4 py-4 space-y-5 flex-1">
        {/* Direct Action Strip */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => onStartVoiceCall(user)}
            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#F5C518] hover:bg-[#E0B20F] text-black font-bold text-xs flex items-center justify-center gap-2 transition active:scale-[0.98] cursor-pointer"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Live Voice Call</span>
          </button>
          <button
            type="button"
            onClick={() => onStartChat(user.id)}
            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#17171B] hover:bg-[#222228] text-white border border-zinc-800 font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-[#F5C518]" />
            <span>Open Chat</span>
          </button>
        </div>

        {/* About Me */}
        <div>
          <h3 className="text-xs font-semibold text-zinc-400 mb-1.5">About Me</h3>
          <p className="text-sm text-zinc-200 leading-relaxed">{user.bio}</p>
        </div>

        {/* Clean Unboxed Tribes & Interests */}
        <div className="pt-2 border-t border-zinc-800/80">
          <h3 className="text-xs font-semibold text-zinc-400 mb-1.5">Tribe & Interests</h3>
          <p className="text-sm text-zinc-200 leading-relaxed">
            <span className="text-[#F5C518] font-semibold">{user.tribe}</span>
            {user.tags.map((tag) => (
              <span key={tag} className="text-zinc-300">
                {" "}
                · {tag}
              </span>
            ))}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="bg-[#17171B] rounded-2xl p-4 border border-zinc-800/80 grid grid-cols-2 gap-y-3.5 gap-x-4 text-xs">
          <div>
            <span className="text-zinc-500 block font-medium">Height & Weight</span>
            <span className="text-zinc-100 font-semibold font-mono tabular-nums mt-0.5 block">
              {user.stats}
            </span>
          </div>
          <div>
            <span className="text-zinc-500 block font-medium">Body Type</span>
            <span className="text-zinc-100 font-semibold mt-0.5 block">{user.body}</span>
          </div>
          <div>
            <span className="text-zinc-500 block font-medium">Looking For</span>
            <span className="text-zinc-100 font-semibold mt-0.5 block">{user.looking}</span>
          </div>
          <div>
            <span className="text-zinc-500 block font-medium">Relationship</span>
            <span className="text-zinc-100 font-semibold mt-0.5 block">{user.rel}</span>
          </div>
        </div>

        {/* Unboxed Social References */}
        {(user.instagram || user.music) && (
          <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 pt-1 pb-2">
            {user.instagram && <span>Instagram · {user.instagram}</span>}
            {user.music && (
              <span className="inline-flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-emerald-400" />
                {user.music}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Bottom Sticky Tap & Quick Message Bar */}
      <form
        onSubmit={handleQuickSend}
        className="sticky bottom-0 z-20 bg-[#0E0E10]/95 backdrop-blur-md border-t border-zinc-800 p-3 flex items-center gap-2.5"
      >
        <button
          type="button"
          onClick={handleTap}
          aria-label="Send a Tap"
          className={`w-12 h-12 rounded-full flex items-center justify-center border transition active:scale-90 shrink-0 cursor-pointer ${
            tappedPulse
              ? "bg-[#F5C518] text-black border-[#F5C518]"
              : "bg-[#17171B] hover:bg-[#222228] text-[#F5C518] border-zinc-800"
          }`}
          title="Send a Tap"
        >
          <Flame className="w-5 h-5" />
        </button>

        <div className="flex-1 flex items-center bg-[#17171B] rounded-full px-4 py-1.5 border border-zinc-800 focus-within:border-[#F5C518] transition">
          <input
            type="text"
            value={quickMessage}
            onChange={(e) => setQuickMessage(e.target.value)}
            placeholder={`Message ${user.name}...`}
            className="bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none w-full min-h-[34px]"
          />
          <button
            type="submit"
            aria-label="Send message"
            className="ml-2 w-9 h-9 rounded-full flex items-center justify-center text-[#F5C518] hover:text-[#E0B20F] cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
