"use client";

import { useState } from "react";
import { Player } from "../lib/types";
import api from "../lib/api";
import { Plus, Edit2, Trash2, ShieldAlert, Star, Trophy, Search, X, Flag, AlertCircle } from "lucide-react";

interface PlayerManagerProps {
  players: Player[];
  onRefresh: () => void;
}

const POSITION_BADGE: Record<Player["position"], string> = {
  Goalkeeper: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  Defender:   "bg-blue-500/15 text-blue-400 border-blue-500/30",
  Midfielder: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  Forward:    "bg-rose-500/15 text-rose-400 border-rose-500/30",
};

export default function PlayerManager({ players, onRefresh }: PlayerManagerProps) {
  const [search, setSearch] = useState("");
  const [filterPos, setFilterPos] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [position, setPosition] = useState<Player["position"]>("Midfielder");
  const [goals, setGoals] = useState(0);
  const [rating, setRating] = useState(6.0);
  const [nationality, setNationality] = useState("");
  const [jerseyNumber, setJerseyNumber] = useState<number | "">("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const openAdd = () => {
    setEditingPlayer(null);
    setName(""); setPosition("Midfielder"); setGoals(0);
    setRating(6.0); setNationality(""); setJerseyNumber("");
    setError(""); setIsModalOpen(true);
  };

  const openEdit = (p: Player) => {
    setEditingPlayer(p);
    setName(p.name); setPosition(p.position);
    setGoals(p.goals); setRating(p.rating);
    setNationality(p.nationality ?? "");
    setJerseyNumber(p.jerseyNumber ?? "");
    setError(""); setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Player name is required."); return; }
    setLoading(true); setError("");
    try {
      const payload = {
        name, position, goals, rating,
        nationality: nationality || null,
        jerseyNumber: jerseyNumber !== "" ? jerseyNumber : null,
      };
      if (editingPlayer) {
        await api.put(`/players/${editingPlayer._id}`, payload);
      } else {
        await api.post("/players", payload);
      }
      setIsModalOpen(false);
      onRefresh();
    } catch { setError("Failed to save player. Check server connection."); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this player from the roster?")) return;
    try { await api.delete(`/players/${id}`); onRefresh(); }
    catch { alert("Failed to delete player."); }
  };

  const filtered = players.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchPos = filterPos === "All" || p.position === filterPos;
    return matchSearch && matchPos;
  });

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md">
        <div className="flex flex-1 gap-3 flex-col sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input type="text" placeholder="Search players..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-sm font-medium"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["All", "Goalkeeper", "Defender", "Midfielder", "Forward"].map((pos) => (
              <button key={pos} onClick={() => setFilterPos(pos)}
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
        <button onClick={openAdd}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-900/30 text-sm"
        >
          <Plus className="h-4 w-4" />
          Add Player
        </button>
      </div>

      {/* Players Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-slate-900 border border-slate-800 rounded-xl shadow-md">
          <ShieldAlert className="h-10 w-10 text-slate-600 mb-4" />
          <h3 className="text-base font-bold text-slate-300">No players found</h3>
          <p className="text-xs text-slate-500 mt-1">Adjust filters or add a new player to the roster.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((player) => (
            <div key={player._id}
              className="group flex flex-col bg-slate-900 border border-slate-800 hover:border-emerald-700/50 rounded-xl p-5 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  {player.jerseyNumber && (
                    <span className="text-[10px] font-black text-slate-600 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-full mr-1">
                      #{player.jerseyNumber}
                    </span>
                  )}
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${POSITION_BADGE[player.position]}`}>
                    {player.position}
                  </span>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(player)}
                    className="p-1.5 bg-slate-800 hover:bg-emerald-500/10 hover:text-emerald-400 rounded-lg text-slate-500 border border-slate-700 hover:border-emerald-500/30 transition-colors"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => handleDelete(player._id)}
                    className="p-1.5 bg-slate-800 hover:bg-rose-500/10 hover:text-rose-400 rounded-lg text-slate-500 border border-slate-700 hover:border-rose-500/30 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Name */}
              <h3 className="text-sm font-bold text-slate-100 group-hover:text-emerald-400 transition-colors leading-snug min-h-[2.5rem] flex items-center">
                {player.name}
              </h3>

              {player.nationality && (
                <p className="text-[11px] text-slate-600 flex items-center gap-1 mt-1">
                  <Flag className="h-3 w-3" />{player.nationality}
                </p>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-800/60">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-slate-800/80 rounded-lg text-amber-400 border border-slate-700/60">
                    <Trophy className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-600 uppercase font-bold">Goals</div>
                    <div className="text-sm font-black text-slate-200">{player.goals}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-slate-800/80 rounded-lg text-emerald-400 border border-slate-700/60">
                    <Star className="h-3.5 w-3.5" fill="currentColor" />
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-600 uppercase font-bold">Rating</div>
                    <div className="text-sm font-black text-slate-200">{player.rating.toFixed(1)}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-slate-100">
                {editingPlayer ? "Edit Player Profile" : "Register New Player"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm font-medium">
                  <AlertCircle className="h-4 w-4 shrink-0" />{error}
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name *</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500 text-sm"
                  placeholder="e.g., Dante Silva"
                />
              </div>

              {/* Position */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Position *</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["Goalkeeper", "Defender", "Midfielder", "Forward"] as const).map((pos) => (
                    <button key={pos} type="button" onClick={() => setPosition(pos)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        position === pos
                          ? POSITION_BADGE[pos].replace("/15", "/10").replace("/30", "/40")
                          : "bg-slate-950 text-slate-500 border-slate-700"
                      }`}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row: Nationality + Jersey */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Nationality</label>
                  <input type="text" value={nationality} onChange={(e) => setNationality(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500 text-sm"
                    placeholder="e.g., Brazil"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Jersey #</label>
                  <input type="number" min="1" max="99" value={jerseyNumber}
                    onChange={(e) => setJerseyNumber(e.target.value === "" ? "" : parseInt(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500 text-sm"
                    placeholder="e.g., 10"
                  />
                </div>
              </div>

              {/* Goals */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Goals Scored</label>
                <input type="number" min="0" value={goals}
                  onChange={(e) => setGoals(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500 text-sm"
                />
              </div>

              {/* Rating slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Performance Rating</label>
                  <span className="text-sm font-black text-emerald-400">{rating.toFixed(1)} / 10</span>
                </div>
                <input type="range" min="1" max="10" step="0.1" value={rating}
                  onChange={(e) => setRating(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 h-1.5 rounded-full cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button type="submit" disabled={loading}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2 rounded-xl text-sm transition-colors disabled:opacity-50"
                >
                  {loading ? "Saving..." : editingPlayer ? "Save Changes" : "Register Player"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
