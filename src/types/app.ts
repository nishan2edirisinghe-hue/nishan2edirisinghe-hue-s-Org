export type Tribe = "Jock" | "Twink" | "Bear" | "Geek" | "Otter";

export type VoiceName = "Puck" | "Charon" | "Kore" | "Fenrir" | "Zephyr";

export type TabId = "browse" | "inbox" | "faves";

export type QuickFilterId = "all" | "online" | "fresh" | "favorites" | "rightnow";

export interface UserProfile {
  id: number;
  name: string;
  age: number;
  distance: string;
  distNum: number;
  online: boolean;
  lastSeen?: string;
  fresh: boolean;
  rightNow: boolean;
  verified: boolean;
  tribe: Tribe;
  headline: string;
  bio: string;
  stats: string;
  body: string;
  looking: string;
  rel: string;
  tags: string[];
  instagram?: string;
  music?: string;
  img: string;
  favorite: boolean;
  voiceName: VoiceName;
  mapAngleDeg: number;
}

export interface CurrentUserProfile {
  username: string;
  displayName: string;
  age: number;
  headline: string;
  tribe: Tribe;
  body: string;
  neighborhood: string;
  showDistance: boolean;
  avatarUrl: string;
  authMethod: "demo" | "email" | "phone" | "google";
}

export interface ChatMessage {
  id: string;
  sender: "me" | "them";
  text: string;
  time: string;
  kind?: "text" | "tap" | "location" | "voice_log";
}

export interface Conversation {
  userId: number;
  unread: boolean;
  messages: ChatMessage[];
}

export interface FilterState {
  quickFilter: QuickFilterId;
  searchQuery: string;
  maxRadius: number;
  onlineOnly: boolean;
  maxAge: number;
  tribe: Tribe | "All";
}

export interface CityOption {
  id: string;
  name: string;
  label: string;
  neighborhood: string;
  tag: string;
}

export type LiveVoiceSessionTarget =
  | { mode: "match"; user: UserProfile }
  | { mode: "wingman" };
