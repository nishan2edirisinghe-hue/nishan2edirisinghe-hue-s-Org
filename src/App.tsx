import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Globe,
  LayoutGrid,
  MapPin,
  MessageSquare,
  Mic,
  SlidersHorizontal,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import { ChatView } from "./components/ChatView";
import { ExploreModal } from "./components/ExploreModal";
import { FavoritesView } from "./components/FavoritesView";
import { FilterModal } from "./components/FilterModal";
import { InboxView } from "./components/InboxView";
import { LiveVoiceOverlay } from "./components/LiveVoiceOverlay";
import { LoginScreen } from "./components/LoginScreen";
import { MyProfileModal } from "./components/MyProfileModal";
import { PortraitImage } from "./components/PortraitImage";
import { ProfileDetailView } from "./components/ProfileDetailView";
import { ProximityGrid } from "./components/ProximityGrid";
import { ProximityRadarModal } from "./components/ProximityRadarModal";
import {
  CITIES,
  MY_DEFAULT_PROFILE,
  SEED_CONVERSATIONS,
  SEED_USERS,
} from "./data/seedData";
import {
  clearAppStorage,
  useLocalStorageState,
} from "./hooks/useLocalStorageState";
import type {
  ChatMessage,
  Conversation,
  CurrentUserProfile,
  FilterState,
  LiveVoiceSessionTarget,
  TabId,
  UserProfile,
} from "./types/app";

const DEFAULT_FILTERS: FilterState = {
  quickFilter: "all",
  searchQuery: "",
  maxRadius: 5000,
  onlineOnly: false,
  maxAge: 50,
  tribe: "All",
};

const SIMULATED_REPLIES = [
  "Hey! What's up? Good to hear from you.",
  "Haha nice! How's your day going so far?",
  "I'm free later tonight if you wanna grab a drink or coffee.",
  "Not far from you at all! What are you up to right now?",
  "Sounds good to me — want to hop on a quick voice call?",
];

function formatCurrentTime(): string {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useLocalStorageState<boolean>(
    "grindr_prox_v1_auth",
    false
  );
  const [myProfile, setMyProfile] = useLocalStorageState<CurrentUserProfile>(
    "grindr_prox_v1_my_profile",
    MY_DEFAULT_PROFILE
  );
  const [users, setUsers] = useLocalStorageState<UserProfile[]>(
    "grindr_prox_v1_users",
    SEED_USERS
  );
  const [conversations, setConversations] = useLocalStorageState<Conversation[]>(
    "grindr_prox_v1_conversations",
    SEED_CONVERSATIONS
  );
  const [currentCity, setCurrentCity] = useLocalStorageState<string>(
    "grindr_prox_v1_city",
    "Colombo, Sri Lanka"
  );
  const [filters, setFilters] = useLocalStorageState<FilterState>(
    "grindr_prox_v1_filters",
    DEFAULT_FILTERS
  );

  const [activeTab, setActiveTab] = useState<TabId>("browse");
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);
  const [activeChatUserId, setActiveChatUserId] = useState<number | null>(null);
  const [typingUserId, setTypingUserId] = useState<number | null>(null);

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showExploreModal, setShowExploreModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [showMyProfileModal, setShowMyProfileModal] = useState(false);
  const [voiceTarget, setVoiceTarget] = useState<LiveVoiceSessionTarget | null>(null);

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const replyTimerRef = useRef<number | null>(null);
  const activeChatUserIdRef = useRef<number | null>(null);

  useEffect(() => {
    activeChatUserIdRef.current = activeChatUserId;
  }, [activeChatUserId]);

  const showToast = useCallback((message: string) => {
    setToastMsg(message);
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastMsg(null);
    }, 2600);
  }, []);

  const filteredUsers = useMemo(() => {
    const q = filters.searchQuery.trim().toLowerCase();
    return users
      .filter((user) => {
        if (q) {
          const matches =
            user.name.toLowerCase().includes(q) ||
            user.tribe.toLowerCase().includes(q) ||
            user.headline.toLowerCase().includes(q) ||
            user.tags.some((t) => t.toLowerCase().includes(q));
          if (!matches) return false;
        }
        if (user.distNum > filters.maxRadius) return false;
        if (filters.quickFilter === "online" && !user.online) return false;
        if (filters.quickFilter === "fresh" && !user.fresh) return false;
        if (filters.quickFilter === "favorites" && !user.favorite) return false;
        if (filters.quickFilter === "rightnow" && !user.rightNow) return false;
        if (filters.onlineOnly && !user.online) return false;
        if (user.age > filters.maxAge) return false;
        if (filters.tribe !== "All" && user.tribe !== filters.tribe) return false;
        return true;
      })
      .sort((a, b) => a.distNum - b.distNum);
  }, [filters, users]);

  const freshUsers = useMemo(() => users.filter((u) => u.fresh), [users]);
  const favoriteUsers = useMemo(() => users.filter((u) => u.favorite), [users]);
  const unreadCount = useMemo(
    () => conversations.filter((c) => c.unread).length,
    [conversations]
  );

  const hasAdvancedFilter =
    filters.onlineOnly || filters.maxAge < 50 || filters.tribe !== "All";

  const showFreshStrip =
    filters.quickFilter === "all" &&
    !filters.searchQuery.trim() &&
    filters.maxRadius === 5000 &&
    !hasAdvancedFilter;

  const selectedProfile = useMemo(
    () => users.find((u) => u.id === selectedProfileId) ?? null,
    [selectedProfileId, users]
  );

  const activeChatUser = useMemo(
    () => users.find((u) => u.id === activeChatUserId) ?? null,
    [activeChatUserId, users]
  );

  const activeConversation = useMemo(
    () => conversations.find((c) => c.userId === activeChatUserId),
    [activeChatUserId, conversations]
  );

  const appendMessage = useCallback(
    (
      userId: number,
      sender: "me" | "them",
      text: string,
      kind: ChatMessage["kind"] = "text"
    ) => {
      const entry: ChatMessage = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        sender,
        text,
        time: formatCurrentTime(),
        kind,
      };

      setConversations((prev) => {
        const existing = prev.find((c) => c.userId === userId);
        const isViewingThisChat = activeChatUserIdRef.current === userId;

        if (!existing) {
          return [
            {
              userId,
              unread: sender === "them" && !isViewingThisChat,
              messages: [entry],
            },
            ...prev,
          ];
        }

        const updated: Conversation = {
          ...existing,
          unread:
            sender === "them" && !isViewingThisChat ? true : existing.unread,
          messages: [...existing.messages, entry],
        };
        return [updated, ...prev.filter((c) => c.userId !== userId)];
      });
    },
    [setConversations]
  );

  const scheduleSimulatedReply = useCallback(
    (userId: number) => {
      setTypingUserId(userId);
      if (replyTimerRef.current !== null) {
        window.clearTimeout(replyTimerRef.current);
      }
      replyTimerRef.current = window.setTimeout(() => {
        setTypingUserId(null);
        const reply =
          SIMULATED_REPLIES[Math.floor(Math.random() * SIMULATED_REPLIES.length)];
        appendMessage(userId, "them", reply, "text");
      }, 1450);
    },
    [appendMessage]
  );

  const handleLogin = (
    username: string,
    method: "demo" | "email" | "phone" | "google"
  ) => {
    const cleanDisplay =
      method === "demo"
        ? "Kasun"
        : username.includes("@")
        ? username.split("@")[0]
        : username;
    setMyProfile((prev) => ({
      ...prev,
      username,
      displayName: cleanDisplay,
      authMethod: method,
    }));
    setIsLoggedIn(true);
    showToast(`Signed in as ${cleanDisplay}`);
  };

  const handleLogout = () => {
    setShowMyProfileModal(false);
    setActiveChatUserId(null);
    setSelectedProfileId(null);
    setVoiceTarget(null);
    setIsLoggedIn(false);
    showToast("Logged out");
  };

  const handleResetDemoData = () => {
    clearAppStorage();
    setUsers(SEED_USERS);
    setConversations(SEED_CONVERSATIONS);
    setMyProfile(MY_DEFAULT_PROFILE);
    setCurrentCity("Colombo, Sri Lanka");
    setFilters(DEFAULT_FILTERS);
    setShowMyProfileModal(false);
    showToast("Local demo data restored");
  };

  const handleSelectProfile = (user: UserProfile) => {
    setActiveChatUserId(null);
    setSelectedProfileId(user.id);
  };

  const handleOpenChat = (userId: number) => {
    setSelectedProfileId(null);
    setActiveChatUserId(userId);
    setConversations((prev) => {
      const exists = prev.some((c) => c.userId === userId);
      if (!exists) {
        return [{ userId, unread: false, messages: [] }, ...prev];
      }
      return prev.map((c) => (c.userId === userId ? { ...c, unread: false } : c));
    });
  };

  const handleToggleFavorite = (userId: number) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    const nextFav = !target.favorite;
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, favorite: nextFav } : u))
    );
    showToast(
      nextFav
        ? `Added ${target.name} to Favorites`
        : `Removed ${target.name} from Favorites`
    );
  };

  const handleSendTap = (userId: number) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    appendMessage(userId, "me", "Sent a Tap!", "tap");
    showToast(`You tapped ${target.name}`);
  };

  const handleStartChatFromProfile = (userId: number, initialMessage?: string) => {
    if (initialMessage) {
      appendMessage(userId, "me", initialMessage, "text");
      scheduleSimulatedReply(userId);
    }
    handleOpenChat(userId);
  };

  const handleSendMessage = (userId: number, text: string) => {
    appendMessage(userId, "me", text, "text");
    scheduleSimulatedReply(userId);
  };

  const handleSendLocation = (userId: number) => {
    appendMessage(userId, "me", "Shared Location Pin", "location");
    showToast("Location pin shared");
  };

  const handleChangeCity = (cityName: string) => {
    setCurrentCity(cityName);
    setShowExploreModal(false);
    setUsers((prev) =>
      prev.map((u) => {
        const randDist = Math.floor(Math.random() * 1450) + 60;
        const distStr =
          randDist >= 1000 ? `${(randDist / 1000).toFixed(1)}km` : `${randDist}m`;
        return {
          ...u,
          distNum: randDist,
          distance: distStr,
        };
      })
    );
    showToast(`Exploring ${cityName}`);
  };

  const handleCloseVoice = (callSummary?: {
    userId: number;
    durationSeconds: number;
  }) => {
    setVoiceTarget(null);
    if (callSummary) {
      const mins = Math.floor(callSummary.durationSeconds / 60);
      const secs = callSummary.durationSeconds % 60;
      const formatted = `${mins}:${String(secs).padStart(2, "0")}`;
      appendMessage(
        callSummary.userId,
        "me",
        `Live voice call · ${formatted}`,
        "voice_log"
      );
      showToast(`Voice call ended (${formatted})`);
    }
  };

  if (!isLoggedIn) {
    return (
      <>
        <LoginScreen onLogin={handleLogin} onNotify={showToast} />
        {toastMsg && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 border border-[#F5C518]/60 text-white px-4 py-2.5 rounded-full shadow-2xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap">
            <Zap className="w-3.5 h-3.5 text-[#F5C518]" />
            <span>{toastMsg}</span>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen lg:h-screen bg-[#0E0E10] text-zinc-100 flex flex-col lg:flex-row lg:overflow-hidden max-w-[1440px] mx-auto lg:border-x lg:border-zinc-800/80">
      {/* ========================================== */}
      {/* DESKTOP LEFT NAVIGATION RAIL (lg+)         */}
      {/* ========================================== */}
      <aside className="hidden lg:flex lg:w-60 xl:w-64 shrink-0 flex-col justify-between bg-[#121216] border-r border-zinc-800/80 p-4">
        <div className="space-y-6">
          {/* Brand Mark */}
          <div className="flex items-center gap-2.5 px-2 pt-1">
            <div className="w-8 h-8 rounded-lg bg-[#F5C518] text-black flex items-center justify-center font-extrabold text-base">
              G
            </div>
            <span className="text-lg font-extrabold tracking-tight text-white">GRINDR</span>
          </div>

          {/* Primary Destinations */}
          <nav className="space-y-1" aria-label="Primary navigation">
            <button
              type="button"
              onClick={() => setActiveTab("browse")}
              className={`w-full min-h-[44px] px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-3 transition cursor-pointer ${
                activeTab === "browse"
                  ? "bg-[#F5C518] text-black"
                  : "text-zinc-300 hover:bg-[#1C1C22] hover:text-white"
              }`}
            >
              <LayoutGrid className="w-4 h-4 shrink-0" />
              <span>Browse</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("inbox")}
              className={`w-full min-h-[44px] px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between transition cursor-pointer ${
                activeTab === "inbox"
                  ? "bg-[#F5C518] text-black"
                  : "text-zinc-300 hover:bg-[#1C1C22] hover:text-white"
              }`}
            >
              <span className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4 shrink-0" />
                <span>Inbox</span>
              </span>
              {unreadCount > 0 && (
                <span
                  className={`text-xs font-mono tabular-nums font-bold px-2 py-0.5 rounded-full ${
                    activeTab === "inbox"
                      ? "bg-black text-[#F5C518]"
                      : "bg-[#F5C518] text-black"
                  }`}
                >
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("faves")}
              className={`w-full min-h-[44px] px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between transition cursor-pointer ${
                activeTab === "faves"
                  ? "bg-[#F5C518] text-black"
                  : "text-zinc-300 hover:bg-[#1C1C22] hover:text-white"
              }`}
            >
              <span className="flex items-center gap-3">
                <Star className="w-4 h-4 shrink-0" />
                <span>Faves</span>
              </span>
              <span className="text-xs font-mono tabular-nums opacity-75">
                {favoriteUsers.length}
              </span>
            </button>
          </nav>

          {/* Discovery Tools */}
          <div className="pt-4 border-t border-zinc-800/80 space-y-1">
            <button
              type="button"
              onClick={() => setShowMapModal(true)}
              className="w-full min-h-[42px] px-3 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:bg-[#1C1C22] hover:text-white flex items-center gap-3 transition cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-[#F5C518] shrink-0" />
              <span>Proximity Radar</span>
            </button>

            <button
              type="button"
              onClick={() => setShowFilterModal(true)}
              className="w-full min-h-[42px] px-3 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:bg-[#1C1C22] hover:text-white flex items-center justify-between transition cursor-pointer"
            >
              <span className="flex items-center gap-3">
                <SlidersHorizontal className="w-4 h-4 text-zinc-400 shrink-0" />
                <span>Advanced Filters</span>
              </span>
              {hasAdvancedFilter && (
                <span className="w-2 h-2 rounded-full bg-[#F5C518]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowExploreModal(true)}
              className="w-full min-h-[42px] px-3 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:bg-[#1C1C22] hover:text-white flex items-center gap-3 transition cursor-pointer"
            >
              <Globe className="w-4 h-4 text-zinc-400 shrink-0" />
              <span className="truncate">{currentCity}</span>
            </button>
          </div>

          {/* Voice Wingman CTA */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setVoiceTarget({ mode: "wingman" })}
              className="w-full min-h-[46px] px-3.5 py-2.5 rounded-xl bg-[#1E1E24] hover:bg-[#27272F] border border-[#F5C518]/40 text-white text-xs font-bold flex items-center justify-between transition cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <Mic className="w-4 h-4 text-[#F5C518]" />
                <span>Voice Wingman</span>
              </span>
              <Sparkles className="w-3.5 h-3.5 text-[#F5C518]" />
            </button>
          </div>
        </div>

        {/* Bottom My Profile Trigger */}
        <button
          type="button"
          onClick={() => setShowMyProfileModal(true)}
          className="w-full p-2.5 rounded-2xl bg-[#17171B] hover:bg-[#1E1E24] border border-zinc-800 flex items-center gap-3 text-left transition cursor-pointer"
        >
          <div className="relative shrink-0">
            <PortraitImage
              src={myProfile.avatarUrl}
              alt={myProfile.displayName}
              name={myProfile.displayName}
              className="w-10 h-10 rounded-full object-cover border border-[#F5C518]"
            />
            <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] border-2 border-[#17171B] absolute bottom-0 right-0" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-white truncate">
              {myProfile.displayName}, {myProfile.age}
            </div>
            <div className="text-[11px] text-zinc-400 truncate">
              {myProfile.headline}
            </div>
          </div>
        </button>
      </aside>

      {/* ========================================== */}
      {/* MOBILE TOP HEADER (< lg)                   */}
      {/* ========================================== */}
      <header className="lg:hidden sticky top-0 z-30 h-[57px] bg-[#0E0E10]/95 backdrop-blur-md border-b border-zinc-800 px-3 flex items-center justify-between shrink-0">
        <button
          type="button"
          onClick={() => setShowMyProfileModal(true)}
          aria-label="Open my profile"
          className="relative flex items-center justify-center w-11 h-11 cursor-pointer"
        >
          <PortraitImage
            src={myProfile.avatarUrl}
            alt={myProfile.displayName}
            name={myProfile.displayName}
            className="w-9 h-9 rounded-full object-cover border-2 border-[#F5C518]"
          />
          <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] border-2 border-[#0E0E10] absolute bottom-1 right-1" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#F5C518] text-black flex items-center justify-center font-extrabold text-xs">
            G
          </div>
          <span className="font-extrabold tracking-tight text-base text-white">GRINDR</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setVoiceTarget({ mode: "wingman" })}
            aria-label="Open Voice Wingman"
            title="Voice Wingman"
            className="w-10 h-10 rounded-xl bg-[#17171B] border border-zinc-800 text-[#F5C518] flex items-center justify-center transition cursor-pointer"
          >
            <Mic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setShowMapModal(true)}
            aria-label="Open proximity map"
            className="w-10 h-10 rounded-xl text-zinc-300 hover:text-[#F5C518] flex items-center justify-center transition cursor-pointer"
          >
            <MapPin className="w-4 h-4 text-[#F5C518]" />
          </button>
          <button
            type="button"
            onClick={() => setShowFilterModal(true)}
            aria-label="Open filters"
            className="relative w-10 h-10 rounded-xl text-zinc-300 hover:text-[#F5C518] flex items-center justify-center transition cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {hasAdvancedFilter && (
              <span className="w-2 h-2 rounded-full bg-[#F5C518] absolute top-2 right-2" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setShowExploreModal(true)}
            aria-label="Explore cities"
            className="w-10 h-10 rounded-xl text-zinc-300 hover:text-[#F5C518] flex items-center justify-center transition cursor-pointer"
          >
            <Globe className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ========================================== */}
      {/* CENTER WORKSPACE (Browse / Inbox / Faves)  */}
      {/* ========================================== */}
      <main className="flex-1 min-w-0 lg:overflow-y-auto pb-20 lg:pb-6">
        {activeTab === "browse" && (
          <ProximityGrid
            users={filteredUsers}
            freshUsers={freshUsers}
            filters={filters}
            selectedUserId={selectedProfileId}
            showFreshStrip={showFreshStrip}
            onUpdateFilters={(patch) =>
              setFilters((prev) => ({ ...prev, ...patch }))
            }
            onResetFilters={() => setFilters(DEFAULT_FILTERS)}
            onSelectUser={handleSelectProfile}
          />
        )}

        {activeTab === "inbox" && (
          <InboxView
            conversations={conversations}
            users={users}
            activeChatUserId={activeChatUserId}
            onOpenChat={handleOpenChat}
            onStartVoiceCall={(user) => setVoiceTarget({ mode: "match", user })}
          />
        )}

        {activeTab === "faves" && (
          <FavoritesView
            favorites={favoriteUsers}
            selectedUserId={selectedProfileId}
            onSelectUser={handleSelectProfile}
          />
        )}
      </main>

      {/* ========================================== */}
      {/* DESKTOP RIGHT DOCKED INSPECTOR (lg+)       */}
      {/* ========================================== */}
      <aside className="hidden lg:flex lg:w-[390px] xl:w-[430px] shrink-0 flex-col border-l border-zinc-800/80 bg-[#0E0E10] overflow-hidden">
        {activeChatUser ? (
          <ChatView
            user={activeChatUser}
            conversation={activeConversation}
            isTyping={typingUserId === activeChatUser.id}
            onBack={() => setActiveChatUserId(null)}
            onOpenProfile={(id) => {
              setActiveChatUserId(null);
              setSelectedProfileId(id);
            }}
            onSendMessage={handleSendMessage}
            onSendLocation={handleSendLocation}
            onRequestAlbum={() => showToast("Private album access requested")}
            onStartVoiceCall={(user) => setVoiceTarget({ mode: "match", user })}
          />
        ) : selectedProfile ? (
          <ProfileDetailView
            user={selectedProfile}
            onClose={() => setSelectedProfileId(null)}
            onToggleFavorite={handleToggleFavorite}
            onSendTap={handleSendTap}
            onStartChat={handleStartChatFromProfile}
            onStartVoiceCall={(user) => setVoiceTarget({ mode: "match", user })}
            onShareLink={(user) =>
              showToast(`Profile link for ${user.name} copied to clipboard`)
            }
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#17171B] border border-zinc-800 flex items-center justify-center text-[#F5C518]">
              <Sparkles className="w-7 h-7" />
            </div>
            <div className="space-y-1.5 max-w-xs">
              <h3 className="text-base font-bold text-white">
                Inspect a profile or start talking
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Select any guy from the proximity grid to view his full bio, send a Tap, open chat, or launch a live voice conversation.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setVoiceTarget({ mode: "wingman" })}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#F5C518] hover:bg-[#E0B20F] text-black font-bold text-xs flex items-center gap-2 transition cursor-pointer"
            >
              <Mic className="w-4 h-4" />
              <span>Talk to Voice Wingman</span>
            </button>
          </div>
        )}
      </aside>

      {/* ========================================== */}
      {/* MOBILE SLIDE-OVER PROFILE / CHAT (< lg)    */}
      {/* ========================================== */}
      {selectedProfile && (
        <div className="fixed inset-0 z-40 lg:hidden bg-[#0E0E10]">
          <ProfileDetailView
            user={selectedProfile}
            isModal
            onClose={() => setSelectedProfileId(null)}
            onToggleFavorite={handleToggleFavorite}
            onSendTap={handleSendTap}
            onStartChat={handleStartChatFromProfile}
            onStartVoiceCall={(user) => setVoiceTarget({ mode: "match", user })}
            onShareLink={(user) =>
              showToast(`Profile link for ${user.name} copied to clipboard`)
            }
          />
        </div>
      )}

      {activeChatUser && (
        <div className="fixed inset-0 z-40 lg:hidden bg-[#0E0E10]">
          <ChatView
            user={activeChatUser}
            conversation={activeConversation}
            isTyping={typingUserId === activeChatUser.id}
            onBack={() => setActiveChatUserId(null)}
            onOpenProfile={(id) => {
              setActiveChatUserId(null);
              setSelectedProfileId(id);
            }}
            onSendMessage={handleSendMessage}
            onSendLocation={handleSendLocation}
            onRequestAlbum={() => showToast("Private album access requested")}
            onStartVoiceCall={(user) => setVoiceTarget({ mode: "match", user })}
          />
        </div>
      )}

      {/* ========================================== */}
      {/* MOBILE BOTTOM NAVIGATION BAR (< lg)        */}
      {/* ========================================== */}
      <nav
        aria-label="Mobile navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-30 h-16 bg-[#0E0E10]/95 backdrop-blur-md border-t border-zinc-800 grid grid-cols-3"
      >
        <button
          type="button"
          onClick={() => {
            setSelectedProfileId(null);
            setActiveChatUserId(null);
            setActiveTab("browse");
          }}
          className={`flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
            activeTab === "browse"
              ? "text-[#F5C518]"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <LayoutGrid className="w-5 h-5" />
          <span className="text-[11px] font-semibold">Browse</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedProfileId(null);
            setActiveChatUserId(null);
            setActiveTab("inbox");
          }}
          className={`relative flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
            activeTab === "inbox"
              ? "text-[#F5C518]"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-[11px] font-semibold">Inbox</span>
          {unreadCount > 0 && (
            <span className="absolute top-2 right-[28%] bg-[#F5C518] text-black text-[10px] font-mono font-extrabold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedProfileId(null);
            setActiveChatUserId(null);
            setActiveTab("faves");
          }}
          className={`flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
            activeTab === "faves"
              ? "text-[#F5C518]"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Star className="w-5 h-5" />
          <span className="text-[11px] font-semibold">Faves</span>
        </button>
      </nav>

      {/* ========================================== */}
      {/* SHARED OVERLAY MODALS                      */}
      {/* ========================================== */}
      {showFilterModal && (
        <FilterModal
          filters={filters}
          onUpdate={(patch) => setFilters((prev) => ({ ...prev, ...patch }))}
          onReset={() => setFilters(DEFAULT_FILTERS)}
          onClose={() => setShowFilterModal(false)}
        />
      )}

      {showExploreModal && (
        <ExploreModal
          cities={CITIES}
          currentCity={currentCity}
          onSelectCity={handleChangeCity}
          onClose={() => setShowExploreModal(false)}
        />
      )}

      {showMapModal && (
        <ProximityRadarModal
          users={filteredUsers}
          currentCity={currentCity}
          onClose={() => setShowMapModal(false)}
          onSelectUser={handleSelectProfile}
          onOpenExplore={() => {
            setShowMapModal(false);
            setShowExploreModal(true);
          }}
          onRecenter={() => showToast(`Centered on ${currentCity}`)}
        />
      )}

      {showMyProfileModal && (
        <MyProfileModal
          profile={myProfile}
          currentCity={currentCity}
          onSave={(patch) => {
            setMyProfile((prev) => ({ ...prev, ...patch }));
            setShowMyProfileModal(false);
            showToast("Profile updated");
          }}
          onResetDemoData={handleResetDemoData}
          onLogout={handleLogout}
          onClose={() => setShowMyProfileModal(false)}
        />
      )}

      {voiceTarget && (
        <LiveVoiceOverlay
          target={voiceTarget}
          currentCity={currentCity}
          myProfile={myProfile}
          nearbyUsers={filteredUsers}
          conversations={conversations}
          onClose={handleCloseVoice}
        />
      )}

      {toastMsg && (
        <div className="fixed top-16 lg:top-5 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 border border-[#F5C518]/60 text-white px-4 py-2.5 rounded-full shadow-2xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap pointer-events-none">
          <Zap className="w-3.5 h-3.5 text-[#F5C518]" />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
}
