"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Player } from "../../lib/types";
import api from "../../lib/api";
import { Trophy, Star, Search, User, Loader2, AlertCircle, Flag } from "lucide-react";
import Link from "next/link";

// ── Position badge config ────────────────────────────────────────────────────
const POSITION_BADGE: Record<Player["position"], { label: string; classes: string }> = {
  Goalkeeper: { label: "GK",  classes: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  Defender:   { label: "DEF", classes: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  Midfielder: { label: "MID", classes: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  Forward:    { label: "FWD", classes: "bg-rose-500/15 text-rose-400 border-rose-500/30" },
};

const RATING_COLOR = (rating: number): string => {
  if (rating >= 9) return "text-amber-400";
  if (rating >= 8) return "text-emerald-400";
  return "text-slate-400";
};

// ── Default avatar SVG fallback ───────────────────────────────────────────────
function AvatarFallback({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-800">
      <span className="text-2xl font-black text-emerald-400">{initials}</span>
    </div>
  );
}

// ── Skeleton Loader ───────────────────────────────────────────────────────────
function PlayerSkeleton() {
  return (
    <div className="flex flex-col items-center bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md animate-pulse">
      {/* Avatar skeleton */}
      <div className="w-24 h-24 rounded-full bg-slate-800 mb-4 shrink-0" />
      
      {/* Badge skeleton */}
      <div className="w-12 h-4 bg-slate-800 rounded-full mb-3" />
      
      {/* Name skeleton */}
      <div className="w-3/4 h-5 bg-slate-800 rounded-md mb-2" />
      
      {/* Nationality skeleton */}
      <div className="w-1/2 h-3 bg-slate-800 rounded-md mb-4" />
      
      {/* Divider */}
      <div className="w-full border-t border-slate-800 my-4" />
      
      {/* Stats row skeleton */}
      <div className="grid grid-cols-2 gap-3 w-full mb-4">
        <div className="h-14 bg-slate-800 rounded-xl" />
        <div className="h-14 bg-slate-800 rounded-xl" />
      </div>
      
      {/* Button skeleton */}
      <div className="w-full h-10 bg-slate-800 rounded-xl" />
    </div>
  );
}

// ── Player Card ───────────────────────────────────────────────────────────────
function PlayerCard({ player }: { player: Player }) {
  const badge = POSITION_BADGE[player.position];
  const [imgError, setImgError] = useState(false);

  return (
    <div className="group flex flex-col items-center bg-slate-900 border border-slate-800 hover:border-emerald-700/60 rounded-xl p-6 shadow-md hover:shadow-emerald-950/30 transition-all duration-200 hover:-translate-y-1">
      {/* Jersey number badge */}
      {player.jerseyNumber && (
        <div className="self-start -mt-1 mb-2">
          <span className="text-[10px] font-black text-slate-500 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-full">
            #{player.jerseyNumber}
          </span>
        </div>
      )}

      {/* Profile photo */}
      <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-emerald-600/30 shadow-inner bg-gray-50 mb-4 shrink-0">
        {!imgError && player.imageUrl ? (
          <img
            src={player.imageUrl}
            alt={player.name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <AvatarFallback name={player.name} />
        )}
      </div>

      {/* Position badge */}
      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border mb-2 ${badge.classes}`}>
        {player.position}
      </span>

      {/* Name */}
      <h3 className="text-base font-bold text-slate-100 text-center leading-snug group-hover:text-emerald-400 transition-colors line-clamp-2 min-h-[2.5rem] flex items-center">
        {player.name}
      </h3>

      {/* Nationality */}
      {player.nationality && (
        <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
          <Flag className="h-3 w-3" />
          {player.nationality}
        </p>
      )}

      {/* Divider */}
      <div className="w-full border-t border-slate-800 my-4" />

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 w-full mb-4">
        <div className="flex flex-col items-center bg-slate-950/60 border border-slate-800 rounded-xl p-2.5">
          <Trophy className="h-4 w-4 text-amber-400 mb-1" />
          <span className="text-xs font-black text-slate-200">{player.goals}</span>
          <span className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">Goals</span>
        </div>
        <div className="flex flex-col items-center bg-slate-950/60 border border-slate-800 rounded-xl p-2.5">
          <Star className="h-4 w-4 text-emerald-400 mb-1" fill="currentColor" />
          <span className={`text-xs font-black ${RATING_COLOR(player.rating)}`}>{player.rating.toFixed(1)}</span>
          <span className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">Rating</span>
        </div>
      </div>

      {/* Action Button */}
      <Link href={`/players/${player._id}`} className="mt-auto w-full flex items-center justify-center bg-slate-800/60 hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-400 border border-slate-700 hover:border-emerald-500/30 font-bold py-2.5 rounded-xl text-xs transition-all duration-200 group-hover:shadow-md group-hover:shadow-emerald-500/5">
        View Details
      </Link>
    </div>
  );
}

// ── Main PlayerList Component ─────────────────────────────────────────────────
export default function PlayerList() {
  const [search, setSearch] = useState("");
  const [filterPos, setFilterPos] = useState<string>("All");

  const {
    data: players = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<Player[]>({
    queryKey: ["players"],
    queryFn: async () => {
      const res = await api.get<Player[]>("/players");
      return res.data;
    },
  });

  const filtered = players.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchPos = filterPos === "All" || p.position === filterPos;
    return matchSearch && matchPos;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-md">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search players by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors text-sm font-medium"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["All", "Goalkeeper", "Defender", "Midfielder", "Forward"].map((pos) => (
            <button
              key={pos}
              onClick={() => setFilterPos(pos)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                filterPos === pos
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/40"
                  : "bg-slate-950 text-slate-400 border-slate-700 hover:border-slate-600"
              }`}
            >
              {pos === "Goalkeeper" ? "GK" : pos === "Defender" ? "DEF" : pos === "Midfielder" ? "MID" : pos === "Forward" ? "FWD" : "All"}
            </button>
          ))}
        </div>
      </div>

      {/* States */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <PlayerSkeleton key={i} />
          ))}
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center justify-center py-16 bg-slate-900 border border-rose-500/20 rounded-xl">
          <AlertCircle className="h-10 w-10 text-rose-400 mb-3" />
          <h4 className="text-base font-bold text-slate-200 mb-1">Failed to load player data</h4>
          <p className="text-sm text-slate-500 mb-4">Ensure the Express server is running on port 5000.</p>
          <button
            onClick={() => refetch()}
            className="bg-rose-500/10 text-rose-400 border border-rose-500/30 px-4 py-2 rounded-xl text-sm font-bold hover:bg-rose-500/20 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 bg-slate-900 border border-slate-800 rounded-xl">
          <User className="h-10 w-10 text-slate-600 mb-3" />
          <h4 className="text-base font-bold text-slate-300">No players found</h4>
          <p className="text-sm text-slate-500 mt-1">Try adjusting your search or position filter.</p>
        </div>
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <>
          <div className="flex justify-between items-center px-1">
            <p className="text-xs text-slate-500 font-medium">
              Showing <span className="text-emerald-400 font-bold">{filtered.length}</span> of {players.length} players
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((player) => (
              <PlayerCard key={player._id} player={player} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
