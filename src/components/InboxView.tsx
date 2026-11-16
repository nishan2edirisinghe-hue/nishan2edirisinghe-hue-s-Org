import { MessageSquare, PhoneCall } from "lucide-react";
import type { Conversation, UserProfile } from "../types/app";
import { PortraitImage } from "./PortraitImage";

interface InboxViewProps {
  conversations: Conversation[];
  users: UserProfile[];
  activeChatUserId: number | null;
  onOpenChat: (userId: number) => void;
  onStartVoiceCall: (user: UserProfile) => void;
}

export function InboxView({
  conversations,
  users,
  activeChatUserId,
  onOpenChat,
  onStartVoiceCall,
}: InboxViewProps) {
  const unreadCount = conversations.filter((c) => c.unread).length;

  return (
    <div className="flex flex-col">
      <div className="px-4 py-3.5 border-b border-zinc-800/80 flex items-center justify-between">
        <h2 className="text-base font-bold text-white">Messages</h2>
        {unreadCount > 0 && (
          <span className="text-xs font-semibold text-[#F5C518] font-mono tabular-nums">
            {unreadCount} Unread
          </span>
        )}
      </div>

      {conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#17171B] border border-zinc-800 flex items-center justify-center text-zinc-500 mb-3">
            <MessageSquare className="w-5 h-5" />
          </div>
          <p className="text-sm font-semibold text-zinc-300">No messages yet</p>
          <p className="text-xs text-zinc-500 mt-1">
            Tap any profile in Browse to say hello or start a voice call.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-zinc-800/70">
          {conversations.map((conv) => {
            const user = users.find((u) => u.id === conv.userId);
            if (!user) return null;
            const lastMsg = conv.messages[conv.messages.length - 1];
            const isSelected = activeChatUserId === user.id;

            return (
              <div
                key={conv.userId}
                className={`px-4 py-3 flex items-center gap-3 transition ${
                  isSelected
                    ? "bg-[#1D1D23]"
                    : conv.unread
                    ? "bg-[#17171B]/60 hover:bg-[#17171B]"
                    : "hover:bg-[#17171B]/50"
                }`}
              >
                <button
                  type="button"
                  onClick={() => onOpenChat(user.id)}
                  className="flex-1 min-w-0 flex items-center gap-3 text-left cursor-pointer"
                >
                  <div className="relative shrink-0">
                    <PortraitImage
                      src={user.img}
                      alt={user.name}
                      name={user.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <span
                      className={`w-3 h-3 rounded-full border-2 border-[#0E0E10] absolute bottom-0 right-0 ${
                        user.online ? "bg-[#22C55E]" : "bg-zinc-500"
                      }`}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-sm font-bold text-white truncate">{user.name}</span>
                        <span className="text-xs text-zinc-500">·</span>
                        <span className="text-xs font-mono tabular-nums text-zinc-400 shrink-0">
                          {user.distance}
                        </span>
                      </div>
                      <span
                        className={`text-[11px] font-mono tabular-nums shrink-0 ${
                          conv.unread ? "text-[#F5C518] font-bold" : "text-zinc-500"
                        }`}
                      >
                        {lastMsg ? lastMsg.time : ""}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={`text-xs truncate ${
                          conv.unread ? "text-zinc-100 font-semibold" : "text-zinc-400"
                        }`}
                      >
                        {lastMsg
                          ? `${lastMsg.sender === "me" ? "You: " : ""}${lastMsg.text}`
                          : "Start chatting"}
                      </p>
                      {conv.unread && (
                        <span className="w-2.5 h-2.5 rounded-full bg-[#F5C518] shrink-0" />
                      )}
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onStartVoiceCall(user)}
                  aria-label={`Voice call ${user.name}`}
                  title={`Voice call ${user.name}`}
                  className="w-10 h-10 rounded-full bg-[#222228] hover:bg-[#F5C518] text-zinc-300 hover:text-black flex items-center justify-center transition shrink-0 cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
