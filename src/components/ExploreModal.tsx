import { useState } from "react";
import { Globe, MapPin, Plane, Search, X } from "lucide-react";
import type { CityOption } from "../types/app";

interface ExploreModalProps {
  cities: CityOption[];
  currentCity: string;
  onSelectCity: (cityName: string) => void;
  onClose: () => void;
}

export function ExploreModal({
  cities,
  currentCity,
  onSelectCity,
  onClose,
}: ExploreModalProps) {
  const [query, setQuery] = useState("");

  const filteredCities = cities.filter((city) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      city.name.toLowerCase().includes(q) ||
      city.neighborhood.toLowerCase().includes(q)
    );
  });

  const handleCustomCity = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = query.trim();
    if (!clean) return;
    onSelectCity(clean);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center p-4">
      <div className="w-full max-w-md bg-[#17171B] rounded-2xl border border-zinc-800 p-4 space-y-4 mt-10 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#F5C518]" />
            <span>Explore Locations</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close explore modal"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-[#222228] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleCustomCity} className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search city or neighborhood..."
            className="w-full bg-[#0E0E10] text-sm text-white placeholder-zinc-500 rounded-xl pl-10 pr-4 py-2.5 border border-zinc-800 focus:border-[#F5C518] focus:outline-none"
          />
        </form>

        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-zinc-500 block px-1">
            Popular Cities
          </span>

          {filteredCities.map((city) => {
            const isCurrent = city.name === currentCity;
            return (
              <button
                key={city.id}
                type="button"
                onClick={() => onSelectCity(city.name)}
                className="w-full min-h-[44px] text-left px-3 py-2.5 rounded-xl hover:bg-[#222228] text-xs font-medium text-zinc-200 flex items-center justify-between transition cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  {isCurrent ? (
                    <MapPin className="w-4 h-4 text-[#F5C518]" />
                  ) : (
                    <Plane className="w-4 h-4 text-zinc-400" />
                  )}
                  <span>
                    {city.name}
                    <span className="text-zinc-500"> · {city.neighborhood}</span>
                  </span>
                </span>
                <span
                  className={`text-[11px] font-semibold ${
                    isCurrent ? "text-[#22C55E]" : "text-zinc-500"
                  }`}
                >
                  {isCurrent ? "Active" : "Explore"}
                </span>
              </button>
            );
          })}

          {query.trim() && filteredCities.length === 0 && (
            <button
              type="button"
              onClick={() => onSelectCity(query.trim())}
              className="w-full min-h-[44px] text-left px-3 py-2.5 rounded-xl bg-[#222228] hover:bg-zinc-700 text-xs font-semibold text-[#F5C518] flex items-center justify-between transition cursor-pointer"
            >
              <span>Explore “{query.trim()}”</span>
              <span>Go</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
