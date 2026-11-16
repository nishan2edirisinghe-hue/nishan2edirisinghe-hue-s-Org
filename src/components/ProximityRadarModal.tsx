import { ArrowLeft, Crosshair, ExternalLink, MapPin } from "lucide-react";
import type { UserProfile } from "../types/app";
import { PortraitImage } from "./PortraitImage";

interface ProximityRadarModalProps {
  users: UserProfile[];
  currentCity: string;
  onClose: () => void;
  onSelectUser: (user: UserProfile) => void;
  onOpenExplore: () => void;
  onRecenter: () => void;
}

export function ProximityRadarModal({
  users,
  currentCity,
  onClose,
  onSelectUser,
  onOpenExplore,
  onRecenter,
}: ProximityRadarModalProps) {
  const pinnedUsers = users.slice(0, 8);
  const maxVisibleDist = Math.max(1800, ...pinnedUsers.map((u) => u.distNum));

  return (
    <div className="fixed inset-0 z-50 bg-[#0E0E10] flex flex-col">
      {/* Header */}
      <div className="bg-[#17171B] border-b border-zinc-800 px-3 sm:px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close map view"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-300 hover:text-white hover:bg-[#222228] transition cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#F5C518]" />
              <span>Nearby Proximity Radar</span>
            </h2>
            <button
              type="button"
              onClick={onOpenExplore}
              className="text-xs text-zinc-400 hover:text-[#F5C518] truncate transition cursor-pointer"
            >
              {currentCity} · Change area
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onRecenter}
          className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-[#222228] hover:bg-zinc-700 text-[#F5C518] text-xs font-bold flex items-center gap-1.5 border border-zinc-700/80 transition cursor-pointer shrink-0"
        >
          <Crosshair className="w-3.5 h-3.5" />
          <span>My Pin</span>
        </button>
      </div>

      {/* Interactive Radar Canvas */}
      <div className="relative flex-1 overflow-hidden bg-[radial-gradient(circle_at_center,_#1D1D24_0%,_#0E0E10_72%)] flex items-center justify-center">
        {/* Subtle Street-Grid Backdrop */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, #3f3f46 1px, transparent 1px), linear-gradient(to bottom, #3f3f46 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Concentric Distance Rings */}
        <div className="relative w-[340px] h-[340px] sm:w-[480px] sm:h-[480px] flex items-center justify-center">
          {[
            { size: "100%", label: "2km" },
            { size: "72%", label: "1km" },
            { size: "44%", label: "500m" },
            { size: "20%", label: "250m" },
          ].map((ring) => (
            <div
              key={ring.label}
              className="absolute rounded-full border border-zinc-700/60 pointer-events-none"
              style={{ width: ring.size, height: ring.size }}
            >
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-1.5 bg-[#0E0E10] text-[10px] font-mono tabular-nums text-zinc-500">
                {ring.label}
              </span>
            </div>
          ))}

          {/* Crosshair Axes */}
          <div className="absolute inset-x-0 top-1/2 h-px bg-zinc-800/70 pointer-events-none" />
          <div className="absolute inset-y-0 left-1/2 w-px bg-zinc-800/70 pointer-events-none" />

          {/* Center Self Pin */}
          <div className="relative z-10 w-5 h-5 rounded-full bg-[#F5C518] border-4 border-[#0E0E10] shadow-[0_0_24px_rgba(245,197,24,0.45)]" />

          {/* Nearby User Pins */}
          {pinnedUsers.map((user) => {
            const normalizedRadius = Math.max(
              16,
              Math.min(45, (user.distNum / maxVisibleDist) * 44)
            );
            const angleRad = (user.mapAngleDeg * Math.PI) / 180;
            const xPct = 50 + normalizedRadius * Math.cos(angleRad);
            const yPct = 50 + normalizedRadius * Math.sin(angleRad);

            return (
              <button
                key={user.id}
                type="button"
                onClick={() => {
                  onClose();
                  onSelectUser(user);
                }}
                style={{ left: `${xPct}%`, top: `${yPct}%` }}
                className="absolute z-20 -translate-x-1/2 -translate-y-1/2 group flex flex-col items-center cursor-pointer focus-visible:outline-none"
              >
                <div className="relative w-11 h-11 rounded-full border-2 border-[#F5C518] shadow-lg overflow-hidden bg-[#17171B] group-hover:scale-110 transition">
                  <PortraitImage
                    src={user.img}
                    alt={user.name}
                    name={user.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="mt-1 px-2 py-0.5 rounded-md bg-black/90 text-white text-[10px] font-semibold border border-zinc-800 whitespace-nowrap shadow font-mono tabular-nums">
                  {user.name} · {user.distance}
                </span>
              </button>
            );
          })}
        </div>

        {/* Bottom Nearby Carousel */}
        <div className="absolute bottom-4 left-3 right-3 max-w-2xl mx-auto bg-[#17171B]/95 backdrop-blur-md border border-zinc-800 rounded-2xl p-3.5 shadow-2xl">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-semibold text-zinc-300">Guys Pinned Nearby</span>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(currentCity)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#F5C518] hover:underline font-semibold flex items-center gap-1"
            >
              <span>Open in Google Maps</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-0.5">
            {pinnedUsers.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => {
                  onClose();
                  onSelectUser(user);
                }}
                className="flex-shrink-0 w-40 bg-[#222228] border border-zinc-800 hover:border-[#F5C518] rounded-xl p-2 flex items-center gap-2.5 text-left transition cursor-pointer"
              >
                <PortraitImage
                  src={user.img}
                  alt={user.name}
                  name={user.name}
                  className="w-10 h-10 rounded-full object-cover shrink-0"
                />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">
                    {user.name}, {user.age}
                  </div>
                  <div className="text-[11px] font-mono tabular-nums text-[#F5C518] font-semibold">
                    {user.distance}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
