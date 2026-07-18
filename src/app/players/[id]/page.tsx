"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Player } from "../../../lib/types";
import api from "../../../lib/api";
import {
  Activity,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Flag,
  Globe,
  Goal,
  Loader2,
  MapPin,
  Shield,
  Star,
  Target,
  Trophy,
  User,
  Zap,
} from "lucide-react";
import Navbar from "../../../components/navbar/Navbar";

// Helper components

function StatBox({ label, value, Icon, accent }: { label: string; value: string | number; Icon: React.ElementType; accent: "green" | "amber" | "blue" | "rose" }) {
  const styles = {
    green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    blue:  "bg-blue-500/10 text-blue-400 border-blue-500/30",
    rose:  "bg-rose-500/10 text-rose-400 border-rose-500/30",
  };
  return (
    <div className="flex flex-col items-center bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md">
      <div className={`p-2 rounded-lg border mb-3 ${styles[accent]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <span className="text-xl font-black text-slate-100">{value}</span>
      <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">{label}</span>
    </div>
  );
}

function ProgressRow({ label, score }: { label: string; score: number }) {
  const getGradient = (s: number) => {
    if (s >= 90) return "from-emerald-500 to-emerald-400";
    if (s >= 80) return "from-amber-500 to-amber-400";
    return "from-slate-500 to-slate-400";
  };
  
  return (
    <div className="flex items-center gap-4">
      <div className="w-24 text-xs font-bold text-slate-400 tracking-wide uppercase">{label}</div>
      <div className="flex-1 bg-slate-800 rounded-full h-3 overflow-hidden shadow-inner">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${getGradient(score)} transition-all duration-1000 ease-out`}
          style={{ width: `${score}%` }}
        />
      </div>
      <div className="w-8 text-right text-sm font-black text-slate-200">{score}</div>
    </div>
  );
}

// ── Default avatar SVG fallback
function AvatarFallback({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-800">
      <span className="text-6xl font-black text-emerald-400">{initials}</span>
    </div>
  );
}

export default function PlayerDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  const [player, setPlayer] = useState<Player | null>(null);
  const [squad, setSquad] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Fetch specific player
        const playerRes = await api.get(`/players/${id}`);
        setPlayer(playerRes.data);
        
        // Fetch all players for related section
        const squadRes = await api.get("/players");
        setSquad(squadRes.data.filter((p: Player) => p._id !== id).slice(0, 4));
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 text-emerald-500 animate-spin mb-4" />
          <span className="text-sm font-bold text-slate-500 uppercase tracking-widest animate-pulse">Loading Player Profile...</span>
        </div>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
          <Shield className="h-12 w-12 text-rose-500 mb-4" />
          <h2 className="text-2xl font-black text-slate-200 mb-2">Player Not Found</h2>
          <p className="text-slate-500 mb-6">The requested player profile could not be loaded or does not exist.</p>
          <Link href="/dashboard" className="px-6 py-3 bg-emerald-500/10 text-emerald-400 font-bold rounded-xl border border-emerald-500/30 hover:bg-emerald-500/20 transition-all">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Derive mock performance attributes from rating
  const baseAttr = player.rating * 10;
  const attr = {
    pace: Math.min(99, Math.round(baseAttr * 0.95)),
    shooting: Math.min(99, Math.round(baseAttr * (player.position === "Forward" ? 1.1 : 0.8))),
    passing: Math.min(99, Math.round(baseAttr * (player.position === "Midfielder" ? 1.1 : 0.9))),
    defending: Math.min(99, Math.round(baseAttr * (player.position === "Defender" ? 1.15 : 0.6))),
    physical: Math.min(99, Math.round(baseAttr * 0.92)),
  };

  const getPosColor = (pos: string) => {
    switch(pos) {
      case "Forward": return "text-rose-400 bg-rose-500/10 border-rose-500/30";
      case "Midfielder": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
      case "Defender": return "text-blue-400 bg-blue-500/10 border-blue-500/30";
      case "Goalkeeper": return "text-amber-400 bg-amber-500/10 border-amber-500/30";
      default: return "text-slate-400 bg-slate-800 border-slate-700";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 flex flex-col">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Top navigation */}
          <div className="mb-8">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-emerald-400 transition-colors bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 hover:border-emerald-500/30">
              <ChevronLeft className="h-4 w-4" /> Back to Dashboard
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* ── 1. Layout & Media Section ──────────────────────────────────────── */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {/* Profile Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-slate-800 shadow-xl bg-slate-800 mb-6 relative group">
                    {!imgError && player.imageUrl ? (
                      <img
                        src={player.imageUrl}
                        alt={player.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={() => setImgError(true)}
                      />
                    ) : (
                      <AvatarFallback name={player.name} />
                    )}
                    
                    {/* Jersey Number Overlay */}
                    {player.jerseyNumber && (
                      <div className="absolute bottom-2 right-2 w-12 h-12 bg-slate-900 border-2 border-emerald-500 rounded-full flex items-center justify-center text-xl font-black text-white shadow-lg shadow-black/50">
                        {player.jerseyNumber}
                      </div>
                    )}
                  </div>
                  
                  <h1 className="text-3xl font-black text-white text-center leading-tight mb-2">{player.name}</h1>
                  
                  <div className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest border shadow-sm ${getPosColor(player.position)} mb-6`}>
                    {player.position}
                  </div>

                  <div className="w-full flex justify-between px-6 py-4 bg-slate-950/50 rounded-xl border border-slate-800/80">
                    <div className="text-center">
                      <div className="text-2xl font-black text-amber-400">{player.rating.toFixed(1)}</div>
                      <div className="text-[9px] uppercase tracking-widest font-bold text-slate-500 mt-1">OVR</div>
                    </div>
                    <div className="w-px bg-slate-800" />
                    <div className="text-center">
                      <div className="text-2xl font-black text-emerald-400">{player.goals}</div>
                      <div className="text-[9px] uppercase tracking-widest font-bold text-slate-500 mt-1">Goals</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Club / Media Info */}
              <div className="bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-900/30 rounded-2xl p-6 shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                    <Shield className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-200">Brothers F.C. Kolatuli</h3>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">First Team Squad</p>
                  </div>
                </div>
                <div className="space-y-3 pt-3 border-t border-slate-800/60">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 flex items-center gap-2"><Globe className="h-4 w-4" /> Nationality</span>
                    <span className="font-bold text-slate-200">{player.nationality || "Unknown"}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 flex items-center gap-2"><Calendar className="h-4 w-4" /> Joined</span>
                    <span className="font-bold text-slate-200">August 2024</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── 2. Core Content Sections ──────────────────────────────────────── */}
            <div className="lg:col-span-8 flex flex-col gap-8">
              
              {/* Description / Overview */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="h-5 w-5 text-emerald-400" />
                  <h2 className="text-xl font-black text-white uppercase tracking-tight">Tactical Profile</h2>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-md">
                  <p className="text-sm md:text-base text-slate-300 leading-relaxed">
                    <span className="font-bold text-white">{player.name}</span> currently operates as a key <span className="text-emerald-400 font-bold">{player.position}</span> for Brothers F.C. Kolatuli. 
                    Known for consistent performances and tactical discipline, they have maintained an impressive overall match rating of <span className="font-bold text-amber-400">{player.rating.toFixed(1)}/10</span> this season. 
                    {player.goals > 0 && ` With ${player.goals} goals registered across all competitions, they continue to be a vital asset in the final third.`}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {['First Team', 'Match Fit', player.position === 'Forward' ? 'Finisher' : player.position === 'Midfielder' ? 'Playmaker' : player.position === 'Defender' ? 'Stopper' : 'Reflexes'].map(tag => (
                      <span key={tag} className="px-3 py-1 bg-slate-800 text-slate-400 text-xs font-bold rounded-lg border border-slate-700">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </section>

              {/* Key Information Grid */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Target className="h-5 w-5 text-amber-400" />
                  <h2 className="text-xl font-black text-white uppercase tracking-tight">Technical Specifications</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatBox label="Position" value={player.position === "Goalkeeper" ? "GK" : player.position === "Defender" ? "DEF" : player.position === "Midfielder" ? "MID" : "FWD"} Icon={User} accent="blue" />
                  <StatBox label="Total Goals" value={player.goals} Icon={Goal} accent="emerald" />
                  <StatBox label="Rating" value={player.rating.toFixed(1)} Icon={Star} accent="amber" />
                  <StatBox label="Pref. Foot" value="Right" Icon={Zap} accent="rose" />
                </div>
              </section>

              {/* Reviews / Ratings */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  <h2 className="text-xl font-black text-white uppercase tracking-tight">Performance Review</h2>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-md">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center">
                    <div className="space-y-5">
                      <ProgressRow label="Pace" score={attr.pace} />
                      <ProgressRow label="Shooting" score={attr.shooting} />
                      <ProgressRow label="Passing" score={attr.passing} />
                      <ProgressRow label="Defending" score={attr.defending} />
                      <ProgressRow label="Physical" score={attr.physical} />
                    </div>
                    <div className="flex flex-col items-center justify-center p-8 bg-slate-950/50 rounded-xl border border-slate-800">
                      <div className="relative">
                        <svg className="w-32 h-32 transform -rotate-90">
                          <circle cx="64" cy="64" r="56" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-slate-800" />
                          <circle cx="64" cy="64" r="56" fill="transparent" stroke="currentColor" strokeWidth="8" strokeDasharray="351.8" strokeDashoffset={351.8 - (351.8 * baseAttr) / 100} className="text-emerald-400" strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-3xl font-black text-white">{Math.round(baseAttr)}</span>
                        </div>
                      </div>
                      <span className="mt-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Tactical Score</span>
                    </div>
                  </div>
                </div>
              </section>

            </div>
          </div>

          {/* ── 3. Related Items ──────────────────────────────────────── */}
          {squad.length > 0 && (
            <section className="mt-16 pt-12 border-t border-slate-800/60">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Other Squad Members</h2>
                <Link href="/dashboard" className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors">
                  View Full Roster <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {squad.map(sq => (
                  <Link key={sq._id} href={`/players/${sq._id}`} className="group flex flex-col items-center bg-slate-900 border border-slate-800 hover:border-emerald-700/60 rounded-xl p-5 shadow-md hover:-translate-y-1 transition-all duration-200">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-600/30 mb-3 bg-slate-800 flex items-center justify-center shrink-0">
                      {sq.imageUrl ? (
                        <img src={sq.imageUrl} alt={sq.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-lg font-black text-emerald-400">{sq.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}</span>
                      )}
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border mb-2 ${getPosColor(sq.position)}`}>
                      {sq.position}
                    </span>
                    <h3 className="text-sm font-bold text-slate-100 text-center leading-snug group-hover:text-emerald-400 transition-colors line-clamp-1">{sq.name}</h3>
                    <div className="mt-3 flex gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <span className="flex items-center gap-1"><Star className="h-3 w-3 text-amber-400" /> {sq.rating.toFixed(1)}</span>
                      <span className="flex items-center gap-1"><Trophy className="h-3 w-3 text-emerald-400" /> {sq.goals}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

        </div>
      </main>
    </div>
  );
}
