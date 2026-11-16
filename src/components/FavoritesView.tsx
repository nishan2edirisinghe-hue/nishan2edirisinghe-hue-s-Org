import { Star } from "lucide-react";
import type { UserProfile } from "../types/app";
import { PortraitImage } from "./PortraitImage";

interface FavoritesViewProps {
  favorites: UserProfile[];
  selectedUserId: number | null;
  onSelectUser: (user: UserProfile) => void;
}

export function FavoritesView({
  favorites,
  selectedUserId,
  onSelectUser,
}: FavoritesViewProps) {
  return (
    <div className="p-3 sm:p-4">
      <div className="mb-3">
        <h2 className="text-base font-bold text-white">Favorites</h2>
        <p className="text-xs text-zinc-400">Guys you have starred to keep track of</p>
      </div>

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Star className="w-8 h-8 text-zinc-600 mb-3" />
          <p className="text-sm font-semibold text-zinc-300">No favorites yet</p>
          <p className="text-xs text-zinc-500 mt-1">
            Tap the star icon on any profile to save them here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 xl:grid-cols-3 2xl:grid-cols-4 gap-2">
          {favorites.map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={() => onSelectUser(user)}
              className={`relative aspect-[3/4] bg-[#17171B] rounded-xl overflow-hidden text-left group border transition cursor-pointer ${
                selectedUserId === user.id
                  ? "border-[#F5C518] ring-2 ring-[#F5C518]/80"
                  : "border-zinc-800/70 hover:border-zinc-600"
              }`}
            >
              <PortraitImage
                src={user.img}
                alt={user.name}
                name={user.name}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
              <Star className="w-3.5 h-3.5 text-[#F5C518] fill-[#F5C518] absolute top-2 right-2 drop-shadow" />
              <div className="absolute bottom-2 left-2.5 right-2">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      user.online ? "bg-[#22C55E]" : "bg-zinc-500"
                    }`}
                  />
                  <span className="text-xs sm:text-sm font-bold text-white truncate">
                    {user.name}
                  </span>
                </div>
                <span className="text-[11px] font-mono tabular-nums text-zinc-300 block pl-3.5">
                  {user.distance}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
