import { X } from "lucide-react";
import type { FilterState, Tribe } from "../types/app";

interface FilterModalProps {
  filters: FilterState;
  onUpdate: (patch: Partial<FilterState>) => void;
  onReset: () => void;
  onClose: () => void;
}

const TRIBES: (Tribe | "All")[] = ["All", "Jock", "Twink", "Bear", "Geek", "Otter"];

export function FilterModal({ filters, onUpdate, onReset, onClose }: FilterModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full sm:max-w-md bg-[#17171B] rounded-t-3xl sm:rounded-3xl border-t sm:border border-zinc-800 p-5 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <h3 className="text-base font-bold text-white">Filter Grid</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-[#222228] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Online Only Toggle */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-white">Online Now</div>
            <div className="text-xs text-zinc-400">Only show guys currently active</div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={filters.onlineOnly}
              onChange={(e) => onUpdate({ onlineOnly: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-zinc-700 rounded-full peer peer-checked:bg-[#F5C518] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
          </label>
        </div>

        {/* Max Age Slider */}
        <div>
          <div className="flex justify-between text-xs font-semibold mb-2">
            <span className="text-zinc-300">Maximum Age</span>
            <span className="text-[#F5C518] font-mono tabular-nums font-bold">
              {filters.maxAge} yrs
            </span>
          </div>
          <input
            type="range"
            min={18}
            max={60}
            value={filters.maxAge}
            onChange={(e) => onUpdate({ maxAge: Number(e.target.value) })}
            aria-label="Maximum age"
            className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-[#F5C518]"
          />
        </div>

        {/* Tribe Selector */}
        <div>
          <span className="text-xs font-semibold text-zinc-300 block mb-2">Tribe</span>
          <div className="flex flex-wrap gap-2">
            {TRIBES.map((tribe) => {
              const active = filters.tribe === tribe;
              return (
                <button
                  key={tribe}
                  type="button"
                  onClick={() => onUpdate({ tribe })}
                  className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    active
                      ? "bg-[#F5C518] text-black"
                      : "bg-[#222228] text-zinc-300 hover:bg-zinc-700"
                  }`}
                >
                  {tribe}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              onReset();
              onClose();
            }}
            className="w-1/3 min-h-[44px] py-3 rounded-xl bg-[#222228] text-zinc-300 font-bold text-xs hover:bg-zinc-700 transition cursor-pointer"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-2/3 min-h-[44px] py-3 rounded-xl bg-[#F5C518] text-black font-extrabold text-xs hover:bg-[#E0B20F] transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
