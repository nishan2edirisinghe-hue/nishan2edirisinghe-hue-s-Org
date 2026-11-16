import { Search, Star, UserX, X, Zap } from "lucide-react";
import type { FilterState, QuickFilterId, UserProfile } from "../types/app";
import { PortraitImage } from "./PortraitImage";

interface ProximityGridProps {
  users: UserProfile[];
  freshUsers: UserProfile[];
  filters: FilterState;
  selectedUserId: number | null;
  showFreshStrip: boolean;
  onUpdateFilters: (patch: Partial<FilterState>) => void;
  onResetFilters: () => void;
  onSelectUser: (user: UserProfile) => void;
}

const QUICK_FILTERS: { id: QuickFilterId; label: string }[] = [
  { id: "all", label: "All Nearby" },
  { id: "online", label: "Online" },
  { id: "fresh", label: "Fresh" },
  { id: "favorites", label: "Favorites" },
  { id: "rightnow", label: "Right Now" },
];

export function ProximityGrid({
  users,
  freshUsers,
  filters,
  selectedUserId,
  showFreshStrip,
  onUpdateFilters,
  onResetFilters,
  onSelectUser,
}: ProximityGridProps) {
  return (
    <div className="flex flex-col">
      {/* Search, Radius & Quick Filter Toolbar */}
      <div className="sticky top-[57px] lg:top-0 z-20 bg-[#0E0E10]/95 backdrop-blur-md border-b border-zinc-800/80 px-3 sm:px-4 py-2.5 space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => onUpdateFilters({ searchQuery: e.target.value })}
              placeholder="Search nearby by name, tribe, interest..."
              aria-label="Search nearby profiles"
              className="w-full min-h-[40px] bg-[#17171B] text-xs sm:text-sm text-white placeholder-zinc-500 rounded-xl pl-10 pr-9 py-2 border border-zinc-800 focus:border-[#F5C518] focus:outline-none transition"
            />
            {filters.searchQuery && (
              <button
                type="button"
                onClick={() => onUpdateFilters({ searchQuery: "" })}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <select
            value={filters.maxRadius}
            onChange={(e) => onUpdateFilters({ maxRadius: Number(e.target.value) })}
            aria-label="Filter by maximum distance"
            className="min-h-[40px] bg-[#17171B] text-[#F5C518] font-mono font-semibold text-xs rounded-xl px-3 py-2 border border-zinc-800 focus:border-[#F5C518] focus:outline-none cursor-pointer"
          >
            <option value={5000}>All Dist</option>
            <option value={250}>&lt; 250m</option>
            <option value={500}>&lt; 500m</option>
            <option value={1000}>&lt; 1km</option>
            <option value={2000}>&lt; 2km</option>
          </select>
        </div>

        {/* Interactive Quick Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {QUICK_FILTERS.map((item) => {
            const active = filters.quickFilter === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onUpdateFilters({ quickFilter: item.id })}
                className={`min-h-[36px] px-3.5 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  active
                    ? "bg-[#F5C518] text-black"
                    : "bg-[#17171B] text-zinc-300 hover:bg-[#222228] border border-zinc-800/80"
                }`}
              >
                {item.id === "online" && (
                  <span
                    className={`w-2 h-2 rounded-full ${
                      active ? "bg-black" : "bg-[#22C55E]"
                    }`}
                  />
                )}
                {item.id === "favorites" && (
                  <Star
                    className={`w-3 h-3 ${
                      active ? "text-black fill-black" : "text-[#F5C518] fill-[#F5C518]"
                    }`}
                  />
                )}
                {item.id === "rightnow" && (
                  <Zap
                    className={`w-3 h-3 ${
                      active ? "text-black fill-black" : "text-[#F5C518]"
                    }`}
                  />
                )}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-2 sm:p-3 space-y-4">
        {/* Fresh Faces Strip */}
        {showFreshStrip && freshUsers.length > 0 && (
          <section aria-label="Fresh Faces nearby">
            <div className="flex items-center justify-between px-1 mb-2">
              <h2 className="text-xs font-semibold text-zinc-300">Fresh Faces</h2>
              <span className="text-xs font-medium text-[#F5C518]">New nearby</span>
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {freshUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => onSelectUser(user)}
                  className={`relative flex-shrink-0 w-24 h-32 rounded-xl overflow-hidden text-left group border transition cursor-pointer ${
                    selectedUserId === user.id
                      ? "border-[#F5C518] ring-1 ring-[#F5C518]"
                      : "border-zinc-800 hover:border-zinc-600"
                  }`}
                >
                  <PortraitImage
                    src={user.img}
                    alt={`${user.name}, ${user.age}`}
                    name={user.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                  <span className="absolute top-1.5 right-1.5 bg-[#F5C518] text-black text-[10px] font-bold px-1.5 py-0.5 rounded">
                    New
                  </span>
                  <div className="absolute bottom-2 left-2 right-2 flex items-center gap-1.5">
                    {user.online && (
                      <span
                        className="w-2 h-2 rounded-full bg-[#22C55E] shrink-0"
                        title="Online now"
                      />
                    )}
                    <span className="text-xs font-bold text-white truncate">{user.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Proximity Grid */}
        {users.length > 0 ? (
          <section aria-label="Nearby profiles">
            <div className="grid grid-cols-3 sm:grid-cols-4 xl:grid-cols-3 2xl:grid-cols-4 gap-1.5 sm:gap-2">
              {users.map((user) => {
                const isSelected = selectedUserId === user.id;
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => onSelectUser(user)}
                    className={`relative aspect-[3/4] bg-[#17171B] rounded-xl overflow-hidden text-left group border transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5C518] ${
                      isSelected
                        ? "border-[#F5C518] ring-2 ring-[#F5C518]/80"
                        : "border-zinc-800/70 hover:border-zinc-600"
                    }`}
                  >
                    <PortraitImage
                      src={user.img}
                      alt={`${user.name}, ${user.age}`}
                      name={user.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />

                    {/* Top Indicators */}
                    <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
                      {user.rightNow ? (
                        <span className="bg-black/70 backdrop-blur-sm text-[#F5C518] text-[10px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-1">
                          <Zap className="w-2.5 h-2.5 fill-[#F5C518]" />
                          Now
                        </span>
                      ) : (
                        <span />
                      )}
                      {user.favorite && (
                        <Star className="w-3.5 h-3.5 text-[#F5C518] fill-[#F5C518] drop-shadow" />
                      )}
                    </div>

                    {/* Bottom Identity & Distance */}
                    <div className="absolute bottom-2 left-2.5 right-2">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            user.online ? "bg-[#22C55E]" : "bg-zinc-500"
                          }`}
                          title={user.online ? "Online" : "Offline"}
                        />
                        <span className="text-xs sm:text-sm font-bold text-white truncate drop-shadow">
                          {user.name}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono tabular-nums text-zinc-300 block pl-3.5">
                        {user.distance}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#17171B] border border-zinc-800 flex items-center justify-center text-zinc-500 mb-4">
              <UserX className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">No guys match your filters</h3>
            <p className="text-xs text-zinc-400 max-w-xs mb-5">
              Try clearing your search query or expanding your distance radius to see more profiles nearby.
            </p>
            <button
              type="button"
              onClick={onResetFilters}
              className="min-h-[44px] px-5 py-2.5 bg-[#F5C518] hover:bg-[#E0B20F] text-black font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
