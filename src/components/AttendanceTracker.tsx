"use client";

import { useState, useEffect } from "react";
import { Player, AttendanceRecord } from "../lib/types";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Calendar, CheckCircle2, XCircle, Clock, AlertTriangle, Save, Loader2 } from "lucide-react";

interface AttendanceTrackerProps {
  players: Player[];
}

const getTodayString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export default function AttendanceTracker({ players }: AttendanceTrackerProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";

  const [date, setDate] = useState(getTodayString());
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadAttendance = async () => {
    if (!players.length) return;
    setLoading(true); setMessage(null);
    try {
      const res = await api.get(`/attendance?date=${date}`);
      const serverRecords: AttendanceRecord[] = (res.data?.records ?? []).map((r: AttendanceRecord) => ({
        playerId: typeof r.playerId === "object" ? (r.playerId as { _id: string })._id : r.playerId,
        status: r.status,
      }));
      // Align with full player list
      setRecords(
        players.map((p) => {
          const match = serverRecords.find((r) => r.playerId === p._id);
          return match ?? { playerId: p._id, status: "Present" as const };
        })
      );
    } catch {
      setRecords(players.map((p) => ({ playerId: p._id, status: "Present" as const })));
    } finally { setLoading(false); }
  };

  useEffect(() => { loadAttendance(); }, [date, players.length]);

  const updateStatus = (playerId: string, status: AttendanceRecord["status"]) => {
    if (!isAdmin) return;
    setRecords((prev) => prev.map((r) => r.playerId === playerId ? { ...r, status } : r));
  };

  const saveAttendance = async () => {
    setSaving(true); setMessage(null);
    try {
      await api.post("/attendance", { date, records });
      setMessage({ type: "success", text: `Attendance for ${date} saved successfully.` });
      setTimeout(() => setMessage(null), 3500);
    } catch {
      setMessage({ type: "error", text: "Failed to save attendance. Check server connection." });
    } finally { setSaving(false); }
  };

  const total = records.length;
  const present = records.filter((r) => r.status === "Present").length;
  const late    = records.filter((r) => r.status === "Late").length;
  const absent  = records.filter((r) => r.status === "Absent").length;
  const rate    = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Date + Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md flex flex-col justify-between">
          <div>
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Session Date</h3>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500 text-sm font-semibold"
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-600 mt-4">Select any practice date to view or log attendance records.</p>
        </div>

        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-4">Practice Overview</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Roster", value: total, color: "text-slate-200" },
              { label: "Present", value: present, color: "text-emerald-400" },
              { label: "Late", value: late, color: "text-amber-400" },
              { label: "Absent", value: absent, color: "text-rose-400" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-center">
                <div className="text-[10px] font-bold text-slate-600 uppercase mb-1">{label}</div>
                <div className={`text-2xl font-black ${color}`}>{value}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-800/60">
            <span className="text-xs text-slate-500">Turnout rate:</span>
            <span className={`text-sm font-black ${rate >= 80 ? "text-emerald-400" : rate >= 60 ? "text-amber-400" : "text-rose-400"}`}>
              {rate}%
            </span>
          </div>
        </div>
      </div>

      {/* Player Check-in List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-md overflow-hidden">
        {message && (
          <div className={`p-4 text-sm font-semibold border-b flex items-center gap-2 ${
            message.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/20 text-rose-400"
          }`}>
            {message.text}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-7 w-7 text-emerald-500 animate-spin" />
            <span className="text-xs text-slate-500 mt-3">Loading attendance records...</span>
          </div>
        ) : players.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <AlertTriangle className="h-10 w-10 text-amber-400 mb-3" />
            <h4 className="text-sm font-bold text-slate-300">No players on roster</h4>
            <p className="text-xs text-slate-500 mt-1">Add players first to track attendance.</p>
          </div>
        ) : (
          <div>
            <div className="divide-y divide-slate-800/60">
              {players.map((player) => {
                const rec = records.find((r) => r.playerId === player._id);
                const status = rec?.status ?? "Present";
                return (
                  <div key={player._id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-5 py-4 hover:bg-slate-800/20 transition-colors gap-3"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-slate-100">{player.name}</h4>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wide">{player.position}</span>
                    </div>

                    {/* Status buttons */}
                    <div className="flex gap-2 w-full sm:w-auto">
                      {(["Present", "Late", "Absent"] as const).map((s) => {
                        const active = status === s;
                        const cfg = {
                          Present: { icon: CheckCircle2, active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/40", inactive: "text-slate-500 border-slate-700" },
                          Late:    { icon: Clock,         active: "bg-amber-500/10 text-amber-400 border-amber-500/40",   inactive: "text-slate-500 border-slate-700" },
                          Absent:  { icon: XCircle,       active: "bg-rose-500/10 text-rose-400 border-rose-500/40",     inactive: "text-slate-500 border-slate-700" },
                        }[s];
                        const Icon = cfg.icon;
                        return (
                          <button key={s}
                            onClick={() => updateStatus(player._id, s)}
                            disabled={!isAdmin}
                            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all bg-slate-950 ${active ? cfg.active : cfg.inactive} ${!isAdmin ? "cursor-default" : "hover:opacity-90"}`}
                          >
                            <Icon className="h-3.5 w-3.5" />{s}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {isAdmin && (
              <div className="px-5 py-4 border-t border-slate-800 bg-slate-950/40 flex justify-end">
                <button onClick={saveAttendance} disabled={saving}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2 rounded-xl text-sm transition-colors disabled:opacity-50 shadow-md"
                >
                  {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</> : <><Save className="h-4 w-4" />Save Attendance</>}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
