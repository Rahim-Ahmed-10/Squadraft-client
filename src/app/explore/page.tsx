"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Player } from "../../../lib/types";
import api from "../../../lib/api";
import Navbar from "../../../components/navbar/Navbar";
import { Trophy, Star, Search, User, Loader2, AlertCircle, Flag, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";

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

// ── Shared UI Components ───────────────────────────────────────────────────────
function AvatarFallback({ name }: { name: string }) {
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-800">
      <span className="text-2xl font-black text-emerald-400">{initials}</span>
    </div>
  );
}

function PlayerSkeleton() {
  return (
    <div className="flex flex-col items-center bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md animate-pulse">
      <div className="w-24 h-24 rounded-full bg-slate-800 mb-4 shrink-0" />
      <div className="w-12 h-4 bg-slate-800 rounded-full mb-3" />
      <div className="w-3/4 h-5 bg-slate-800 rounded-md mb-2" />
      <div className="w-1/2 h-3 bg-slate-800 rounded-md mb-4" />
      <div className="w-full border-t border-slate-800 my-4" />
      <div className="grid grid-cols-2 gap-3 w-full mb-4">
        <div className="h-14 bg-slate-800 rounded-xl" />
        <div className="h-14 bg-slate-800 rounded-xl" />
      </div>
      <div className="w-full h-10 bg-slate-800 rounded-xl" />
    </div>
  );
}

function PlayerCard({ player }: { player: Player }) {
  const badge = POSITION_BADGE[player.position];
  const [imgError, setImgError] = useState(false);

  return (
    <div className="group flex flex-col items-center bg-slate-900 border border-slate-800 hover:border-emerald-700/60 rounded-xl p-6 shadow-md hover:shadow-emerald-950/30 transition-all duration-200 hover:-translate-y-1">
      {player.jerseyNumber && (
        <div className="self-start -mt-1 mb-2">
          <span className="text-[10px] font-black text-slate-500 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-full">
            #{player.jerseyNumber}
          </span>
        </div>
      )}
      <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-emerald-600/30 shadow-inner bg-gray-50 mb-4 shrink-0">
        {!imgError && player.imageUrl ? (
          <img src={player.imageUrl} alt={player.name} className="w-full h-full object-cover" onError={() => setImgError(true)} />
        ) : (
          <AvatarFallback name={player.name} />
        )}
      </div>
      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border mb-2 ${badge.classes}`}>
        {player.position}
      </span>
      <h3 className="text-base font-bold text-slate-100 text-center leading-snug group-hover:text-emerald-400 transition-colors line-clamp-2 min-h-[2.5rem] flex items-center">
        {player.name}
      </h3>
      {player.nationality && (
        <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
          <Flag className="h-3 w-3" /> {player.nationality}
        </p>
      )}
      <div className="w-full border-t border-slate-800 my-4" />
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
      <Link href={`/players/${player._id}`} className="mt-auto w-full flex items-center justify-center bg-slate-800/60 hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-400 border border-slate-700 hover:border-emerald-500/30 font-bold py-2.5 rounded-xl text-xs transition-all duration-200 group-hover:shadow-md group-hover:shadow-emerald-500/5">
        View Details
      </Link>
    </div>
  );
}

// ── Main Page Component ───────────────────────────────────────────────────────
export default function ExplorePage() {
  const [search, setSearch] = useState("");
  const [filterPos, setFilterPos] = useState<string>("All");
  const [filterRating, setFilterRating] = useState<string>("All");
  const [sortOption, setSortOption] = useState<string>("Default");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const { data: players = [], isLoading, isError, refetch } = useQuery<Player[]>({
    queryKey: ["players"],
    queryFn: async () => (await api.get<Player[]>("/players")).data,
  });

  // Derived state: Filter & Sort
  const processedPlayers = useMemo(() => {
    let result = [...players];

    // Search filter
    if (search) {
      result = result.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    }

    // Position filter
    if (filterPos !== "All") {
      result = result.filter((p) => p.position === filterPos);
    }

    // Rating filter
    if (filterRating !== "All") {
      if (filterRating === "Elite") result = result.filter((p) => p.rating >= 9);
      else if (filterRating === "Great") result = result.filter((p) => p.rating >= 8 && p.rating < 9);
      else if (filterRating === "Good") result = result.filter((p) => p.rating < 8);
    }

    // Sorting
    if (sortOption === "Goals (High to Low)") {
      result.sort((a, b) => b.goals - a.goals);
    } else if (sortOption === "Rating (High to Low)") {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [players, search, filterPos, filterRating, sortOption]);

  // Reset pagination when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [search, filterPos, filterRating, sortOption]);

  // Pagination logic
  const totalPages = Math.ceil(processedPlayers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPlayers = processedPlayers.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-300">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-black text-white uppercase tracking-tight">Explore SquadRoster</h1>
            <p className="text-slate-500 mt-2 text-sm max-w-2xl">Discover, filter, and analyze players across the academy network using advanced tactical filters and real-time statistics.</p>
          </div>

          {/* Controls Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-md flex flex-col lg:flex-row gap-4">
            
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search player name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors text-sm font-medium h-11"
              />
            </div>

            {/* Filters & Sort */}
            <div className="flex flex-col sm:flex-row gap-4 items-center w-full lg:w-auto">
              
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <SlidersHorizontal className="h-4 w-4 text-slate-500 shrink-0" />
                <select
                  value={filterPos}
                  onChange={(e) => setFilterPos(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-300 text-sm font-medium focus:outline-none focus:border-emerald-500 h-11 w-full sm:w-36 appearance-none cursor-pointer"
                >
                  <option value="All">All Positions</option>
                  <option value="Forward">Forward</option>
                  <option value="Midfielder">Midfielder</option>
                  <option value="Defender">Defender</option>
                  <option value="Goalkeeper">Goalkeeper</option>
                </select>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Star className="h-4 w-4 text-slate-500 shrink-0" />
                <select
                  value={filterRating}
                  onChange={(e) => setFilterRating(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-300 text-sm font-medium focus:outline-none focus:border-emerald-500 h-11 w-full sm:w-36 appearance-none cursor-pointer"
                >
                  <option value="All">All Ratings</option>
                  <option value="Elite">Elite (9.0+)</option>
                  <option value="Great">Great (8.0-8.9)</option>
                  <option value="Good">Good (&lt; 8.0)</option>
                </select>
              </div>

              <div className="w-full sm:w-px sm:h-8 bg-slate-800" />

              <div className="w-full sm:w-auto">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-300 text-sm font-medium focus:outline-none focus:border-emerald-500 h-11 w-full sm:w-44 appearance-none cursor-pointer"
                >
                  <option value="Default">Sort: Default</option>
                  <option value="Goals (High to Low)">Goals (High to Low)</option>
                  <option value="Rating (High to Low)">Rating (High to Low)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Info */}
          {!isLoading && !isError && (
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-widest px-1">
              <span>Showing {processedPlayers.length > 0 ? startIndex + 1 : 0} - {Math.min(startIndex + itemsPerPage, processedPlayers.length)} of {processedPlayers.length} Players</span>
            </div>
          )}

          {/* Grid View */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => <PlayerSkeleton key={i} />)}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-900 border border-rose-500/20 rounded-2xl shadow-md">
              <AlertCircle className="h-12 w-12 text-rose-400 mb-4" />
              <h3 className="text-lg font-black text-slate-200 mb-2">Failed to load players</h3>
              <p className="text-slate-500 text-sm mb-6 text-center max-w-sm">We couldn't connect to the server. Please ensure the backend is running.</p>
              <button onClick={() => refetch()} className="bg-rose-500/10 text-rose-400 border border-rose-500/30 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-rose-500/20 transition-colors">
                Retry Connection
              </button>
            </div>
          ) : paginatedPlayers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-slate-900 border border-slate-800 rounded-2xl shadow-md">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4 border border-emerald-500/20">
                <Search className="h-7 w-7 text-emerald-400" />
              </div>
              <h3 className="text-xl font-black text-slate-200 mb-2">No players found</h3>
              <p className="text-slate-500 text-sm">Try adjusting your filters or search terms to find what you're looking for.</p>
              <button 
                onClick={() => { setSearch(""); setFilterPos("All"); setFilterRating("All"); setSortOption("Default"); }} 
                className="mt-6 text-sm font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-6 py-2.5 rounded-xl transition-all"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {paginatedPlayers.map((player) => (
                <PlayerCard key={player._id} player={player} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {!isLoading && !isError && totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-slate-800/60 mt-8">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-emerald-400"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </button>
              
              <div className="hidden sm:flex items-center gap-2">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold transition-all border ${
                      currentPage === i + 1
                        ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <span className="sm:hidden text-sm font-bold text-slate-500">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-emerald-400"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
