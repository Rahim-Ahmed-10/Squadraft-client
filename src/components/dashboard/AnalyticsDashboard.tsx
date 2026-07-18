"use client";

import { Player } from "../../lib/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
} from "recharts";

interface AnalyticsDashboardProps {
  players: Player[];
}

// Design system palette
const COLORS = {
  green: "#10b981",   // emerald-500
  greenDark: "#059669", // emerald-600
  amber: "#f59e0b",   // amber-500
  amberLight: "#fbbf24",
  slate: "#64748b",
  slateLight: "#94a3b8",
};

const POSITION_COLORS: Record<string, string> = {
  Goalkeeper: "#f59e0b",
  Defender:   "#3b82f6",
  Midfielder: "#10b981",
  Forward:    "#ef4444",
};

// Custom tooltip shared style
const TooltipStyle = {
  contentStyle: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "12px",
    color: "#e2e8f0",
    fontSize: "12px",
    fontWeight: 600,
  },
};

export default function AnalyticsDashboard({ players }: AnalyticsDashboardProps) {
  if (players.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-500 text-sm font-medium">
        No player data available to visualise.
      </div>
    );
  }

  // ── Chart 1: Top Scorers Bar Chart ────────────────────────────────────────
  const topScorers = [...players]
    .sort((a, b) => b.goals - a.goals)
    .slice(0, 8)
    .map((p) => ({
      name: p.name.split(" ").slice(-1)[0], // Last name only
      goals: p.goals,
      fill: p.position === "Forward" ? COLORS.amber : COLORS.green,
    }));

  // ── Chart 2: Performance Ratings Bar Chart ───────────────────────────────
  const ratingData = [...players]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 8)
    .map((p) => ({
      name: p.name.split(" ").slice(-1)[0],
      rating: p.rating,
    }));

  // ── Chart 3: Position Distribution Pie ───────────────────────────────────
  const positionCounts: Record<string, number> = {};
  players.forEach((p) => {
    positionCounts[p.position] = (positionCounts[p.position] || 0) + 1;
  });
  const positionData = Object.entries(positionCounts).map(([name, value]) => ({
    name,
    value,
  }));

  // ── Chart 4: Team Radar ───────────────────────────────────────────────────
  const avgByPosition: Record<string, { totalRating: number; totalGoals: number; count: number }> = {};
  players.forEach((p) => {
    if (!avgByPosition[p.position]) avgByPosition[p.position] = { totalRating: 0, totalGoals: 0, count: 0 };
    avgByPosition[p.position].totalRating += p.rating;
    avgByPosition[p.position].totalGoals += p.goals;
    avgByPosition[p.position].count += 1;
  });
  const radarData = Object.entries(avgByPosition).map(([pos, d]) => ({
    position: pos,
    "Avg Rating": parseFloat((d.totalRating / d.count).toFixed(1)),
    "Avg Goals": parseFloat((d.totalGoals / d.count).toFixed(1)),
  }));

  return (
    <div className="space-y-6">
      {/* Row 1: Scorers + Ratings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Goals Scored */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
            Top Goal Scorers
          </h3>
          <p className="text-xs text-slate-500 mb-5">Goals across all registered squad members</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topScorers} barSize={22} margin={{ left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...TooltipStyle} cursor={{ fill: "#1e293b" }} />
              <Bar dataKey="goals" radius={[6, 6, 0, 0]}>
                {topScorers.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Performance Ratings */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            Performance Ratings
          </h3>
          <p className="text-xs text-slate-500 mb-5">Overall squad performance scores (1–10 scale)</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ratingData} barSize={22} margin={{ left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[6, 10]} tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...TooltipStyle} cursor={{ fill: "#1e293b" }} />
              <Bar dataKey="rating" fill={COLORS.green} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Position Pie + Team Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Position Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
            Squad Composition
          </h3>
          <p className="text-xs text-slate-500 mb-5">Tactical position breakdown of full roster</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={positionData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {positionData.map((entry, index) => (
                  <Cell key={index} fill={POSITION_COLORS[entry.name] || COLORS.slate} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip {...TooltipStyle} />
              <Legend
                formatter={(value) => (
                  <span style={{ color: "#94a3b8", fontSize: "11px", fontWeight: 600 }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Radar Chart by Position */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />
            Positional Averages
          </h3>
          <p className="text-xs text-slate-500 mb-5">Average rating and goals by positional group</p>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#1e293b" />
              <PolarAngleAxis dataKey="position" tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <Radar name="Avg Rating" dataKey="Avg Rating" stroke={COLORS.green} fill={COLORS.green} fillOpacity={0.2} />
              <Radar name="Avg Goals" dataKey="Avg Goals" stroke={COLORS.amber} fill={COLORS.amber} fillOpacity={0.15} />
              <Tooltip {...TooltipStyle} />
              <Legend
                formatter={(value) => (
                  <span style={{ color: "#94a3b8", fontSize: "11px", fontWeight: 600 }}>{value}</span>
                )}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
