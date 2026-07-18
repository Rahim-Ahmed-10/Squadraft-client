"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/navbar/Navbar";
import PlayerList from "../../components/dashboard/PlayerList";
import AnalyticsDashboard from "../../components/dashboard/AnalyticsDashboard";
import PlayerManager from "../../components/PlayerManager";
import AttendanceTracker from "../../components/AttendanceTracker";
import NoticeBoard from "../../components/NoticeBoard";
import LineupBuilder from "../../components/LineupBuilder";
import api from "../../lib/api";
import { Player, Notice } from "../../lib/types";
import {
  LayoutDashboard,
  Users,
  CalendarCheck2,
  Megaphone,
  Trophy,
  BarChart2,
  Loader2,
  ChevronRight,
  Star,
  TrendingUp,
  Activity,
} from "lucide-react";

type Tab = "overview" | "analytics" | "roster" | "lineup" | "attendance" | "notices" | "profile";

// ── Stat card ──────────────────────────────────────────────────────────────
function StatCard({
  label, value, sub, Icon, accent,
}: {
  label: string; value: string | number; sub: string;
  Icon: React.ElementType; accent: "green" | "amber" | "blue" | "rose";
}) {
  const styles = {
    green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    blue:  "bg-blue-500/10 text-blue-400 border-blue-500/20",
    rose:  "bg-rose-500/10 text-rose-400 border-rose-500/20",
  };
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md hover:border-slate-700 transition-all">
      <div className="flex justify-between items-start">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
        <div className={`p-2 rounded-lg border ${styles[accent]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-4">
        <span className="text-3xl font-black text-slate-100">{value}</span>
      </div>
      <p className="mt-3 text-xs text-slate-500 border-t border-slate-800/60 pt-2.5 leading-relaxed">{sub}</p>
    </div>
  );
}

// ── Main Dashboard App ──────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  const isAdmin = user?.role === "Admin";

  // Fetch data with React Query (only when authenticated)
  const { data: players = [], refetch: refetchPlayers } = useQuery<Player[]>({
    queryKey: ["players"],
    queryFn: async () => (await api.get<Player[]>("/players")).data,
    enabled: !!user,
  });

  const { data: notices = [], refetch: refetchNotices } = useQuery<Notice[]>({
    queryKey: ["notices"],
    queryFn: async () => (await api.get<Notice[]>("/notices")).data,
    enabled: !!user,
  });

  const handleRefresh = () => { refetchPlayers(); refetchNotices(); };

  const handleTabChange = (tab: string) => setActiveTab(tab as Tab);

  // ── Auth loading ───────────────────────────────────────────────────────
  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
            <Activity className="h-4 w-4 text-emerald-400 absolute inset-0 m-auto" />
          </div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">
            Authenticating...
          </span>
        </div>
      </div>
    );
  }

  // ── Dashboard View ────────────────────────────────────────────────────
  const topScorer = [...players].sort((a, b) => b.goals - a.goals)[0];
  const avgRating = players.length > 0
    ? (players.reduce((s, p) => s + p.rating, 0) / players.length).toFixed(1)
    : "—";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 flex flex-col">
      {/* Navbar (auth-aware, with tab switching for logged-in users) */}
      <Navbar onTabChange={handleTabChange} isDashboard />

      {/* Dashboard shell */}
      <div className="flex flex-1 min-h-0">

        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-56 bg-slate-900 border-r border-slate-800 shrink-0">
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {(isAdmin
              ? [
                  { id: "overview", label: "Dashboard",   Icon: LayoutDashboard },
                  { id: "analytics",label: "Analytics",   Icon: BarChart2 },
                  { id: "roster",   label: "Players",     Icon: Users },
                  { id: "lineup",   label: "Lineup",      Icon: Trophy },
                  { id: "attendance",label:"Attendance",  Icon: CalendarCheck2 },
                  { id: "notices",  label: "Notices",     Icon: Megaphone },
                ]
              : [
                  { id: "overview", label: "Dashboard",   Icon: LayoutDashboard },
                  { id: "analytics",label: "Analytics",   Icon: BarChart2 },
                  { id: "roster",   label: "Squad",       Icon: Users },
                  { id: "notices",  label: "Notices",     Icon: Megaphone },
                ]
            ).map(({ id, label, Icon }) => (
              <button key={id} onClick={() => setActiveTab(id as Tab)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === id
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
                {activeTab === id && <ChevronRight className="h-3 w-3 ml-auto opacity-50" />}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-6xl mx-auto space-y-6">

            {/* ── OVERVIEW ──────────────────────────────────────────────── */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Banner */}
                <div className="relative bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8 overflow-hidden shadow-md">
                  <div className="absolute right-0 top-0 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
                  <div className="relative z-10">
                    <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
                      <Trophy className="h-3 w-3" />
                      {isAdmin ? "Admin — Full Access" : "Player View"}
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                      Welcome, <span className="text-emerald-400 capitalize">{user.username.replace(/_/g, " ")}</span>
                    </h2>
                    <p className="text-sm text-slate-400 mt-2 max-w-xl leading-relaxed">
                      {isAdmin
                        ? "Manage your squad, configure formations, log attendance, and push club-wide notices."
                        : "View the active squad roster, check performance analytics, and read the latest club notices."}
                    </p>
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  <StatCard label="Roster"       value={players.length} sub={`${players.filter(p => p.position === "Forward").length} FWD · ${players.filter(p => p.position === "Goalkeeper").length} GK`}                         Icon={Users}           accent="green" />
                  <StatCard label="Avg Rating"   value={avgRating}      sub="Performance score out of 10.0"                                                                                                                              Icon={Star}            accent="amber" />
                  <StatCard label="Top Scorer"   value={topScorer ? topScorer.goals : 0}  sub={topScorer ? `${topScorer.name}` : "No players yet"}                                                                                       Icon={Trophy}          accent="rose"  />
                  <StatCard label="Notices"      value={notices.length} sub={notices[0] ? `Latest: ${notices[0].category}` : "No notices yet"}                                                                                           Icon={Megaphone}       accent="blue"  />
                </div>

                {/* Preview row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2 uppercase tracking-wide">
                        <Megaphone className="h-3.5 w-3.5 text-emerald-400" /> Recent Notices
                      </h3>
                      <button onClick={() => setActiveTab("notices")} className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                        View All <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                    {notices.length === 0 ? (
                      <p className="text-center py-8 text-xs text-slate-600">No notices yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {notices.slice(0, 2).map((n) => (
                          <div key={n._id} className="flex items-start gap-3 p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                            <span className={`shrink-0 px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                              n.category === "Match" ? "bg-rose-500/15 text-rose-400 border-rose-500/20"
                              : n.category === "Training" ? "bg-amber-500/15 text-amber-400 border-amber-500/20"
                              : "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                            }`}>{n.category}</span>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-200 truncate">{n.title}</p>
                              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{n.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2 uppercase tracking-wide">
                        <TrendingUp className="h-3.5 w-3.5 text-amber-400" /> Top Performers
                      </h3>
                    </div>
                    <div className="flex-1 space-y-2.5">
                      {[...players].sort((a, b) => b.rating - a.rating).slice(0, 4).map((p, i) => (
                        <div key={p._id} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`font-black w-4 shrink-0 ${i === 0 ? "text-amber-400" : "text-slate-600"}`}>{i + 1}</span>
                            <span className="font-semibold text-slate-300 truncate">{p.name}</span>
                          </div>
                          <span className="font-black text-emerald-400 shrink-0 ml-2">★ {p.rating.toFixed(1)}</span>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => setActiveTab("analytics")}
                      className="mt-4 w-full text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-emerald-400 bg-slate-800/60 border border-slate-700 py-2 rounded-xl transition-colors"
                    >
                      View Full Analytics
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── ANALYTICS ─────────────────────────────────────────────── */}
            {activeTab === "analytics" && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-black text-white uppercase tracking-tight">Squad Analytics</h2>
                  <p className="text-xs text-slate-500 mt-1">Performance metrics and statistical visualisations.</p>
                </div>
                <AnalyticsDashboard players={players} />
              </div>
            )}

            {/* ── ROSTER ────────────────────────────────────────────────── */}
            {activeTab === "roster" && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-black text-white uppercase tracking-tight">
                    {isAdmin ? "Players Roster" : "Squad Roster"}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {isAdmin ? "Manage player profiles, statistics, and ratings." : "Registered squad members — read only."}
                  </p>
                </div>
                {isAdmin ? <PlayerManager players={players} onRefresh={handleRefresh} /> : <PlayerList />}
              </div>
            )}

            {/* ── LINEUP (Admin only) ───────────────────────────────────── */}
            {activeTab === "lineup" && isAdmin && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-black text-white uppercase tracking-tight">Lineup Builder</h2>
                  <p className="text-xs text-slate-500 mt-1">Set your tactical formation and assign starting players.</p>
                </div>
                <LineupBuilder players={players} />
              </div>
            )}

            {/* ── ATTENDANCE (Admin only) ───────────────────────────────── */}
            {activeTab === "attendance" && isAdmin && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-black text-white uppercase tracking-tight">Attendance Tracker</h2>
                  <p className="text-xs text-slate-500 mt-1">Log daily training check-ins and audit turnout rates.</p>
                </div>
                <AttendanceTracker players={players} />
              </div>
            )}

            {/* ── NOTICES ───────────────────────────────────────────────── */}
            {activeTab === "notices" && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-black text-white uppercase tracking-tight">Club Notice Board</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {isAdmin ? "Publish match alerts, training updates, and announcements." : "Latest club announcements."}
                  </p>
                </div>
                <NoticeBoard notices={notices} onRefresh={handleRefresh} />
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
