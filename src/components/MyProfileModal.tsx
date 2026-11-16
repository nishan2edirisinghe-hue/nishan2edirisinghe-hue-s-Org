import { useState } from "react";
import { RotateCcw, X } from "lucide-react";
import type { CurrentUserProfile, Tribe } from "../types/app";
import { PortraitImage } from "./PortraitImage";

interface MyProfileModalProps {
  profile: CurrentUserProfile;
  currentCity: string;
  onSave: (patch: Partial<CurrentUserProfile>) => void;
  onResetDemoData: () => void;
  onLogout: () => void;
  onClose: () => void;
}

const TRIBES: Tribe[] = ["Jock", "Twink", "Bear", "Geek", "Otter"];

export function MyProfileModal({
  profile,
  currentCity,
  onSave,
  onResetDemoData,
  onLogout,
  onClose,
}: MyProfileModalProps) {
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [headline, setHeadline] = useState(profile.headline);
  const [tribe, setTribe] = useState<Tribe>(profile.tribe);
  const [showDistance, setShowDistance] = useState(profile.showDistance);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      displayName: displayName.trim() || profile.displayName,
      headline: headline.trim() || profile.headline,
      tribe,
      showDistance,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full sm:max-w-md bg-[#17171B] rounded-t-3xl sm:rounded-3xl border-t sm:border border-zinc-800 p-5 space-y-4 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">My Profile</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close my profile"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-[#222228] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <PortraitImage
            src={profile.avatarUrl}
            alt={profile.displayName}
            name={profile.displayName}
            className="w-16 h-16 rounded-full object-cover border-2 border-[#F5C518] shrink-0"
          />
          <div className="min-w-0">
            <h4 className="text-lg font-bold text-white truncate">
              {profile.displayName}, <span className="font-mono tabular-nums">{profile.age}</span>
            </h4>
            <p className="text-xs text-[#22C55E] font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
              <span>Online & Visible</span>
            </p>
            <p className="text-xs text-zinc-400 mt-0.5 truncate">
              {currentCity} · {profile.body} · {tribe}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-[#0E0E10] p-3 rounded-xl border border-zinc-800 space-y-1.5">
            <label htmlFor="my-name-input" className="text-xs font-semibold text-zinc-400 block">
              Display Name
            </label>
            <input
              id="my-name-input"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-[#17171B] text-xs text-white px-3 py-2 rounded-lg border border-zinc-800 focus:border-[#F5C518] focus:outline-none"
            />
          </div>

          <div className="bg-[#0E0E10] p-3 rounded-xl border border-zinc-800 space-y-1.5">
            <label htmlFor="my-tribe-select" className="text-xs font-semibold text-zinc-400 block">
              Tribe
            </label>
            <select
              id="my-tribe-select"
              value={tribe}
              onChange={(e) => setTribe(e.target.value as Tribe)}
              className="w-full bg-[#17171B] text-xs text-white px-3 py-2 rounded-lg border border-zinc-800 focus:border-[#F5C518] focus:outline-none"
            >
              {TRIBES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-[#0E0E10] p-3 rounded-xl border border-zinc-800 space-y-1.5">
          <label htmlFor="my-headline-input" className="text-xs font-semibold text-zinc-400 block">
            Display Headline
          </label>
          <input
            id="my-headline-input"
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            className="w-full bg-[#17171B] text-xs text-white px-3 py-2 rounded-lg border border-zinc-800 focus:border-[#F5C518] focus:outline-none"
          />
        </div>

        <label className="flex items-center justify-between bg-[#0E0E10] p-3.5 rounded-xl border border-zinc-800 cursor-pointer">
          <span className="text-xs font-semibold text-white">Show Approximate Distance</span>
          <input
            type="checkbox"
            checked={showDistance}
            onChange={(e) => setShowDistance(e.target.checked)}
            className="accent-[#F5C518] w-4 h-4"
          />
        </label>

        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={onResetDemoData}
            className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 min-h-[36px] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Local Data</span>
          </button>
        </div>

        <div className="flex gap-2.5 pt-1">
          <button
            type="button"
            onClick={onLogout}
            className="w-1/3 min-h-[44px] py-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-400 font-bold text-xs hover:bg-red-500/25 transition cursor-pointer"
          >
            Log Out
          </button>
          <button
            type="submit"
            className="w-2/3 min-h-[44px] py-3 rounded-xl bg-[#F5C518] text-black font-extrabold text-xs hover:bg-[#E0B20F] transition cursor-pointer"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
