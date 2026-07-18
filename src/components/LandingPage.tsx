"use client";

import { useState, useEffect, useRef, FormEvent, useCallback } from "react";
import Link from "next/link";
import Navbar from "./navbar/Navbar";
import { useAuth } from "../context/AuthContext";
import {
  Activity, Trophy, Users, CalendarCheck2, Megaphone, BarChart2,
  Shield, ChevronRight, Star, CheckCircle2, Mail, MapPin, Phone,
  Eye, EyeOff, Loader2, AlertCircle, ArrowRight, X, LogIn, Zap,
  ChevronDown, ChevronLeft, ChevronUp, MessageCircle, Code, Briefcase,
  Camera, PlayCircle, TrendingUp, Award, Clock, Target, Layers,
  BookOpen, Send, ExternalLink, CheckCircle, Circle, LayoutDashboard
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────

const HERO_SLIDES = [
  {
    id: "lineup",
    badge: "Tactical Pitch",
    heading: "Build Your Perfect",
    headingAccent: "Starting 11",
    sub: "Drag and drop players onto an interactive football pitch. Switch between 4-4-2, 4-3-3, 3-5-2 and 7 other formations instantly.",
    accent: "emerald" as const,
    Visual: PitchVisual,
  },
  {
    id: "analytics",
    badge: "Performance Data",
    heading: "Visualise Every",
    headingAccent: "Squad Metric",
    sub: "Recharts-powered dashboards show top scorers, positional averages, rating distributions, and squad composition at a glance.",
    accent: "amber" as const,
    Visual: AnalyticsVisual,
  },
  {
    id: "roster",
    badge: "Player Profiles",
    heading: "Complete Squad",
    headingAccent: "Management",
    sub: "Manage every player — positions, goals, performance ratings, nationality and jersey numbers. Full CRUD from any device.",
    accent: "emerald" as const,
    Visual: RosterVisual,
  },
];

const FEATURES = [
  { Icon: Trophy,       accent: "emerald", title: "Live Lineup Builder",          desc: "Arrange your starting 11 on an interactive tactical pitch. Switch formations with a single click." },
  { Icon: Users,        accent: "amber",   title: "Player Profile Management",     desc: "Full CRUD roster — track positions, goals, ratings, nationality and jersey numbers." },
  { Icon: CalendarCheck2,accent:"emerald", title: "Attendance Tracker",            desc: "Log Present / Late / Absent per training session. Instant turnout percentage reports." },
  { Icon: Megaphone,    accent: "amber",   title: "Club Notice Board",             desc: "Publish match alerts, training briefings, and announcements to all players in real time." },
  { Icon: BarChart2,    accent: "emerald", title: "Performance Analytics",         desc: "Bar, donut and radar charts powered by Recharts. Goal tallies, ratings, positional averages." },
  { Icon: Shield,       accent: "amber",   title: "Role-Based JWT Auth",            desc: "Coach / Admin owns the full platform; Players get a curated read-only view of squad data." },
];

const STEPS = [
  { step: "01", Icon: LogIn,     title: "Create Your Club Account", desc: "Register as a Coach / Admin in seconds. No credit card, no setup fees — your dashboard is live immediately." },
  { step: "02", Icon: Users,     title: "Add Your Squad Roster",    desc: "Register each player with position, nationality, jersey number, and an initial performance rating." },
  { step: "03", Icon: Trophy,    title: "Set Formations & Go",      desc: "Choose a tactical formation, drag players into their positions, save the lineup and share it with the squad." },
];

const TESTIMONIALS = [
  { name: "Marcus Thompson",   role: "Youth Academy Director · Sheffield FC",   rating: 5, quote: "SquadCraft completely eliminated our end-of-season spreadsheet chaos. Attendance, lineups, and notices all in one place. The analytics alone are worth it." },
  { name: "Sofia Andreescu",   role: "Head Coach · Bucharest Ladies FC",        rating: 5, quote: "The role-based access is a game changer. I can push tactical notices and manage lineups while my players see only what they need. Professional and clean." },
  { name: "James O'Donoghue", role: "Club Manager · Galway United Academy",    rating: 5, quote: "We onboarded our entire squad in under 20 minutes. The formation builder is intuitive, and the Recharts analytics give us genuine insight into performance trends." },
];

const FAQS = [
  { q: "Is SquadCraft free to use?", a: "Yes — the full platform is available at no cost for academies and amateur clubs. A professional tier with priority support and advanced exports is coming soon." },
  { q: "What formations are supported?", a: "SquadCraft currently supports 4-4-2, 4-3-3, 3-5-2, 4-2-3-1, 5-3-2, 3-4-3, 4-5-1 and more. New formations are added regularly based on community requests." },
  { q: "Can players log in and see their own stats?", a: "Absolutely. Players register with the 'Player' role and get a focused dashboard showing their profile, the squad roster, analytics, and the club notice board. They cannot edit any data." },
  { q: "Is the data stored securely?", a: "All data is stored on MongoDB Atlas with end-to-end TLS encryption. Authentication uses JWT tokens with bcrypt password hashing — no plain-text credentials are ever stored." },
  { q: "Can I manage multiple teams?", a: "Multi-club support is on our roadmap. Currently, each MongoDB database instance serves one club. Contact us if you need a custom multi-tenant setup." },
  { q: "How do I seed realistic player data to get started?", a: "Run 'npm run seed' from the server directory. This populates 12 real squad members, 3 club notices, and two demo accounts (Coach + Player) into your MongoDB Atlas database instantly." },
];

const BLOG_POSTS = [
  { tag: "Tactics",     title: "The 4-3-3 Formation: Strengths, Weaknesses & When To Use It",       date: "Jul 14, 2024", read: "5 min" },
  { tag: "Coaching",    title: "Why Every Youth Academy Needs a Digital Attendance System",           date: "Jul 7, 2024",  read: "4 min" },
  { tag: "Analytics",   title: "Using Performance Ratings to Identify Your Most Consistent Players", date: "Jul 1, 2024",  read: "6 min" },
];

const STATS_DATA = [
  { value: 2400, suffix: "+", label: "Clubs Using SquadCraft", Icon: Trophy },
  { value: 28000, suffix: "+", label: "Players Registered",   Icon: Users },
  { value: 340000, suffix: "+", label: "Lineups Saved",        Icon: Layers },
  { value: 99,    suffix: "%",  label: "Uptime Guaranteed",    Icon: Award },
];

// ─────────────────────────────────────────────────────────────────────────────
// HERO VISUALS
// ─────────────────────────────────────────────────────────────────────────────

function PitchVisual() {
  return (
    <div className="relative w-full max-w-xs sm:max-w-sm mx-auto select-none">
      {/* Pitch */}
      <div className="relative bg-emerald-900/30 border-2 border-emerald-600/30 rounded-2xl overflow-hidden aspect-[3/4] shadow-2xl shadow-emerald-900/40">
        {/* Field lines */}
        <div className="absolute inset-4 border border-emerald-500/20 rounded-lg" />
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-emerald-500/20 -translate-x-1/2" />
        <div className="absolute left-1/2 top-1/2 w-16 h-16 border border-emerald-500/20 rounded-full -translate-x-1/2 -translate-y-1/2" />
        {/* Goal boxes */}
        <div className="absolute top-4 left-1/2 w-24 h-8 border border-emerald-500/25 -translate-x-1/2 rounded-b-lg" />
        <div className="absolute bottom-4 left-1/2 w-24 h-8 border border-emerald-500/25 -translate-x-1/2 rounded-t-lg" />
        {/* Player dots */}
        {[
          { top: "7%",  left: "50%"  },
          { top: "28%", left: "20%"  }, { top: "28%", left: "40%"  }, { top: "28%", left: "60%"  }, { top: "28%", left: "80%"  },
          { top: "50%", left: "20%"  }, { top: "50%", left: "40%"  }, { top: "50%", left: "60%"  }, { top: "50%", left: "80%"  },
          { top: "72%", left: "35%"  }, { top: "72%", left: "65%"  },
        ].map((pos, i) => (
          <div key={i} className="absolute w-7 h-7 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center" style={pos}>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[7px] font-black shadow-md ${i === 0 ? "bg-amber-400 border-amber-300 text-amber-900" : "bg-emerald-500 border-emerald-300 text-white"}`}>
              {i + 1}
            </div>
          </div>
        ))}
        {/* Stripe overlay */}
        <div className="absolute inset-0 flex flex-col pointer-events-none opacity-[0.06]">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={`flex-1 ${i % 2 === 0 ? "bg-emerald-300" : ""}`} />
          ))}
        </div>
      </div>
      {/* Formation badge */}
      <div className="absolute -top-3 -right-3 bg-slate-900 border border-emerald-500/40 text-emerald-400 text-xs font-black px-3 py-1.5 rounded-xl shadow-lg">4-4-2</div>
      <div className="absolute -bottom-3 -left-3 bg-slate-900 border border-slate-700 text-slate-300 text-[10px] font-bold px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5">
        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" /> Live Formation
      </div>
    </div>
  );
}

function AnalyticsVisual() {
  const bars = [14, 11, 9, 7, 6, 5, 4];
  const names = ["Cian", "Marko", "Adama", "Youssef", "Dante", "Ryo", "Erik"];
  return (
    <div className="relative w-full max-w-xs sm:max-w-sm mx-auto select-none">
      <div className="bg-slate-900/80 border border-slate-700 rounded-2xl p-4 shadow-2xl shadow-black/40 space-y-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Top Goal Scorers</span>
          <span className="text-[9px] text-amber-400 font-bold border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 rounded-full">Season 2024</span>
        </div>
        {bars.map((val, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 w-10 shrink-0 text-right font-semibold">{names[i]}</span>
            <div className="flex-1 bg-slate-800 rounded-full h-5 overflow-hidden">
              <div
                className={`h-full rounded-full flex items-center justify-end pr-2 text-[9px] font-black text-white ${i < 2 ? "bg-gradient-to-r from-amber-600 to-amber-400" : "bg-gradient-to-r from-emerald-700 to-emerald-500"}`}
                style={{ width: `${(val / 14) * 100}%`, transition: "width 1s ease" }}
              >
                {val}
              </div>
            </div>
          </div>
        ))}
        {/* Mini donut row */}
        <div className="flex gap-2 pt-2 border-t border-slate-800">
          {[["MID","emerald","4"],["FWD","rose","3"],["DEF","blue","4"],["GK","amber","1"]].map(([pos, c, n]) => (
            <div key={pos} className={`flex-1 rounded-lg p-2 text-center bg-${c}-500/10 border border-${c}-500/20`}>
              <div className={`text-xs font-black text-${c}-400`}>{n}</div>
              <div className={`text-[8px] text-${c}-500 font-bold uppercase`}>{pos}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute -top-3 -right-3 bg-emerald-500 text-white text-[9px] font-black px-2.5 py-1 rounded-lg shadow-md shadow-emerald-500/30">Live Data</div>
    </div>
  );
}

function RosterVisual() {
  const players = [
    { name: "Cian O'Sullivan",  pos: "FWD", goals: 14, rating: 9.1 },
    { name: "Dante Silva",      pos: "MID", goals: 7,  rating: 8.7 },
    { name: "Youssef El Amine", pos: "MID", goals: 6,  rating: 8.5 },
    { name: "Marko Petrović",   pos: "FWD", goals: 11, rating: 8.9 },
  ];
  const posColors: Record<string, string> = {
    FWD: "text-rose-400 bg-rose-500/10 border-rose-500/30",
    MID: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    DEF: "text-blue-400 bg-blue-500/10 border-blue-500/30",
    GK:  "text-amber-400 bg-amber-500/10 border-amber-500/30",
  };
  return (
    <div className="relative w-full max-w-xs sm:max-w-sm mx-auto select-none space-y-2.5">
      {players.map((p) => (
        <div key={p.name} className="flex items-center gap-3 bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 shadow-md">
          <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-sm font-black text-emerald-400 shrink-0">
            {p.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-slate-200 truncate">{p.name}</div>
            <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full border ${posColors[p.pos]}`}>{p.pos}</span>
          </div>
          <div className="flex gap-2 text-right">
            <div>
              <div className="text-xs font-black text-amber-400">{p.goals}</div>
              <div className="text-[8px] text-slate-600 uppercase">gls</div>
            </div>
            <div>
              <div className="text-xs font-black text-emerald-400">{p.rating}</div>
              <div className="text-[8px] text-slate-600 uppercase">rtg</div>
            </div>
          </div>
        </div>
      ))}
      <div className="absolute -top-3 -right-3 bg-slate-900 border border-amber-500/40 text-amber-400 text-[9px] font-black px-2.5 py-1 rounded-lg shadow-md">12 Players</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STAT COUNTER  (counts up when in view)
// ─────────────────────────────────────────────────────────────────────────────

function StatCounter({ value, suffix, label, Icon }: { value: number; suffix: string; label: string; Icon: React.ElementType }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1800;
          const steps = 60;
          const inc = value / steps;
          let cur = 0;
          const timer = setInterval(() => {
            cur += inc;
            if (cur >= value) { setCount(value); clearInterval(timer); }
            else setCount(Math.round(cur));
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="flex flex-col items-center text-center p-6 bg-slate-900 border border-slate-800 rounded-xl shadow-md hover:border-emerald-700/40 transition-all">
      <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mb-4">
        <Icon className="h-5 w-5 text-emerald-400" />
      </div>
      <div className="text-4xl font-black text-white tabular-nums">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-2">{label}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FAQ ACCORDION
// ─────────────────────────────────────────────────────────────────────────────

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${open ? "border-emerald-700/50 bg-emerald-500/5" : "border-slate-800 bg-slate-900"}`}>
      <button onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="text-sm font-bold text-slate-200">{q}</span>
        {open
          ? <ChevronUp className="h-4 w-4 text-emerald-400 shrink-0" />
          : <ChevronDown className="h-4 w-4 text-slate-500 shrink-0" />
        }
      </button>
      {open && (
        <div className="px-5 pb-5">
          <p className="text-sm text-slate-400 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN MODAL
// ─────────────────────────────────────────────────────────────────────────────

function LoginModal({ onClose }: { onClose: () => void }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"Admin" | "Player">("Player");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) { setError("All fields are required."); return; }
    setLoading(true); setError("");
    try {
      if (mode === "login") await login(username, password);
      else await register(username, password, role);
      onClose();
    } catch {
      setError(mode === "login" ? "Invalid credentials. Try coach_silva / admin1234." : "Registration failed.");
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 bg-slate-950/60 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-emerald-400" />
            <span className="text-base font-black text-white uppercase tracking-tight">Squad<span className="text-emerald-400">Craft</span></span>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-200 transition-colors p-1"><X className="h-5 w-5" /></button>
        </div>
        <div className="grid grid-cols-2 border-b border-slate-800">
          {(["login", "register"] as const).map((m) => (
            <button key={m} onClick={() => { setMode(m); setError(""); }}
              className={`py-3.5 text-sm font-bold uppercase tracking-widest transition-all ${mode === m ? "bg-emerald-500/10 text-emerald-400 border-b-2 border-emerald-500" : "text-slate-500 hover:text-slate-300"}`}
            >
              {m === "login" ? "Sign In" : "Register"}
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mode === "login" && (
            <div className="p-3 bg-emerald-500/5 border border-emerald-500/15 rounded-xl text-xs text-slate-400 leading-relaxed">
              <span className="text-emerald-400 font-bold">Demo:</span>{" "}
              <code className="bg-slate-800 px-1.5 py-0.5 rounded font-mono text-amber-300">coach_silva / admin1234</code>
              {" · "}
              <code className="bg-slate-800 px-1.5 py-0.5 rounded font-mono text-emerald-300">cian_osullivan / player1234</code>
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm font-medium">
              <AlertCircle className="h-4 w-4 shrink-0" />{error}
            </div>
          )}
          <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-sm font-medium"
            placeholder="Username"
          />
          <div className="relative">
            <input type={showPw ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 pr-11 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-sm font-medium"
              placeholder="Password"
            />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {mode === "register" && (
            <div className="grid grid-cols-2 gap-3">
              {(["Admin", "Player"] as const).map((r) => (
                <button key={r} type="button" onClick={() => setRole(r)}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${role === r ? r === "Admin" ? "bg-amber-500/10 text-amber-400 border-amber-500/40" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/40" : "bg-slate-950 text-slate-500 border-slate-700"}`}
                >
                  <Shield className="h-3.5 w-3.5" />
                  {r === "Admin" ? "Coach / Admin" : "Player"}
                </button>
              ))}
            </div>
          )}
          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-60 text-sm"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
            {loading ? "Please wait..." : mode === "login" ? "Sign In to Dashboard" : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LANDING PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const SLIDE_DURATION = 5000;

  // Auto-advance hero slider
  useEffect(() => {
    if (paused) return;
    const start = Date.now();
    const tick = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / SLIDE_DURATION) * 100, 100);
      setProgress(pct);
      if (pct >= 100) {
        setSlide((s) => (s + 1) % HERO_SLIDES.length);
        setProgress(0);
      }
    }, 50);
    return () => clearInterval(tick);
  }, [slide, paused]);

  const goToSlide = useCallback((i: number) => { setSlide(i); setProgress(0); }, []);

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  const current = HERO_SLIDES[slide];
  const SlideVisual = current.Visual;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 overflow-x-hidden">
      {/* Navbar */}
      <Navbar onLoginClick={() => setShowModal(true)} />

      {/* Login Modal */}
      {showModal && <LoginModal onClose={() => setShowModal(false)} />}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* § 1 — HERO  (60–70 vh)                                            */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section id="hero"
        className="relative flex items-center overflow-hidden"
        style={{ minHeight: "65vh" }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* BG stripes */}
        <div className="absolute inset-0 flex flex-col opacity-[0.035] pointer-events-none">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className={`flex-1 ${i % 2 === 0 ? "bg-emerald-400" : ""}`} />
          ))}
        </div>
        {/* Glow blobs */}
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-emerald-600/6 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left — text */}
          <div>
            {/* Slide badge */}
            <div key={`badge-${slide}`}
              className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold px-3.5 py-1.5 rounded-full uppercase tracking-widest mb-5"
              style={{ animation: "fadeSlideIn 0.4s ease-out" }}
            >
              <Zap className="h-3 w-3" />{current.badge}
            </div>

            {/* Slide headline */}
            <h1 key={`h1-${slide}`}
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-none mb-5"
              style={{ animation: "fadeSlideIn 0.45s ease-out" }}
            >
              {current.heading}
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-500 bg-clip-text text-transparent">
                {current.headingAccent}
              </span>
            </h1>

            {/* Sub */}
            <p key={`sub-${slide}`}
              className="text-slate-400 text-base leading-relaxed mb-8 max-w-lg"
              style={{ animation: "fadeSlideIn 0.5s ease-out" }}
            >
              {current.sub}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 mb-10">
              {user ? (
                <Link href="/dashboard"
                  className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 text-sm"
                >
                  Go to Dashboard <LayoutDashboard className="h-4 w-4" />
                </Link>
              ) : (
                <button onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 text-sm"
                >
                  Get Started Free <ArrowRight className="h-4 w-4" />
                </button>
              )}
              <button onClick={() => scrollTo("features")}
                className="flex items-center gap-2 bg-slate-800/60 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white font-bold px-6 py-3 rounded-xl transition-all text-sm"
              >
                <PlayCircle className="h-4 w-4 text-emerald-400" /> See Features
              </button>
            </div>

            {/* Slide nav dots + progress */}
            <div className="flex items-center gap-3">
              {HERO_SLIDES.map((_, i) => (
                <button key={i} onClick={() => goToSlide(i)} className="flex flex-col items-center gap-1 group">
                  <div className={`h-1 rounded-full transition-all duration-300 ${i === slide ? "w-8 bg-emerald-400" : "w-4 bg-slate-700 group-hover:bg-slate-500"}`} />
                </button>
              ))}
              <span className="ml-2 text-[10px] text-slate-600 font-semibold uppercase tracking-wider">
                {slide + 1} / {HERO_SLIDES.length}
              </span>
            </div>

            {/* Slide progress bar */}
            <div className="mt-3 h-0.5 bg-slate-800 rounded-full w-32 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-none" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* Right — visual */}
          <div key={`visual-${slide}`} style={{ animation: "fadeSlideInRight 0.5s ease-out" }}>
            <SlideVisual />
          </div>
        </div>

        {/* Visual flow arrow */}
        <button onClick={() => scrollTo("stats")}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-slate-600 hover:text-emerald-400 transition-colors"
          style={{ animation: "bounceY 2s infinite" }}
        >
          <span className="text-[9px] uppercase tracking-widest font-bold">Explore</span>
          <ChevronDown className="h-5 w-5" />
        </button>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* § 2 — STATISTICS                                                   */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section id="stats" className="py-20 px-4 sm:px-6 bg-slate-900/50 border-y border-slate-800">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">By The Numbers</p>
            <h2 className="text-3xl font-black text-white">Trusted by Clubs Worldwide</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS_DATA.map((s) => <StatCounter key={s.label} {...s} />)}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* § 3 — FEATURES                                                     */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section id="features" className="py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest mb-4">
              <Zap className="h-3 w-3" />Platform Features
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">Everything Your Club Needs</h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
              Six integrated modules covering every aspect of modern football club operations.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ Icon, accent, title, desc }) => (
              <div key={title}
                className="group bg-slate-900 border border-slate-800 hover:border-emerald-700/50 rounded-xl p-6 shadow-md hover:shadow-lg hover:-translate-y-1.5 transition-all duration-200"
              >
                <div className={`p-3 rounded-xl w-fit mb-4 ${accent === "emerald" ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-amber-500/10 border border-amber-500/20"}`}>
                  <Icon className={`h-5 w-5 ${accent === "emerald" ? "text-emerald-400" : "text-amber-400"}`} />
                </div>
                <h3 className="text-sm font-bold text-slate-100 group-hover:text-emerald-400 transition-colors mb-2">{title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* § 4 — HOW IT WORKS                                                 */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 bg-slate-900/40">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest mb-4">
              <Target className="h-3 w-3" />Getting Started
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">Up and Running in 3 Steps</h2>
            <p className="text-slate-400 max-w-lg mx-auto text-sm leading-relaxed">
              No complex setup. No IT department needed. From registration to live lineups in minutes.
            </p>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-px bg-gradient-to-r from-transparent via-emerald-600/40 to-transparent pointer-events-none" />

            {STEPS.map(({ step, Icon, title, desc }, i) => (
              <div key={step} className="flex flex-col items-center text-center relative">
                <div className="relative mb-5">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-700 to-emerald-500 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/20">
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-slate-900 border border-emerald-500/50 rounded-full flex items-center justify-center text-[10px] font-black text-emerald-400">
                    {i + 1}
                  </div>
                </div>
                <span className="text-[9px] font-black text-slate-600 tracking-widest uppercase mb-2">{step}</span>
                <h3 className="text-sm font-bold text-slate-100 mb-2 leading-snug">{title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-2 mx-auto bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold px-7 py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 text-sm"
            >
              Start For Free Today <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* § 5 — SQUAD ROLES (Admin vs Player)                                */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section id="roles" className="py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest mb-4">
              <Shield className="h-3 w-3" />Access Control
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">Designed for Every Role</h2>
            <p className="text-slate-400 max-w-lg mx-auto text-sm leading-relaxed">
              JWT-secured role-based access means coaches control everything while players see exactly what they need.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Admin card */}
            <div className="bg-slate-900 border border-amber-600/30 rounded-xl p-7 shadow-md shadow-amber-900/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
              <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest mb-5">
                <Shield className="h-3 w-3" /> Coach / Admin
              </div>
              <h3 className="text-lg font-black text-white mb-5">Full Platform Control</h3>
              <ul className="space-y-3">
                {[
                  "Add, edit & remove players from the roster",
                  "Build and save tactical formations",
                  "Log and audit daily training attendance",
                  "Publish and manage club notices",
                  "View complete squad analytics",
                  "Manage all user accounts",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Player card */}
            <div className="bg-slate-900 border border-emerald-600/30 rounded-xl p-7 shadow-md shadow-emerald-900/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest mb-5">
                <Users className="h-3 w-3" /> Player
              </div>
              <h3 className="text-lg font-black text-white mb-5">Focused Squad View</h3>
              <ul className="space-y-3">
                {[
                  "View the full squad roster and profiles",
                  "Browse performance analytics dashboards",
                  "Read club notices and announcements",
                  "Access their own profile and ratings",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
                {[
                  "Cannot edit player records or lineups",
                  "Cannot post or delete notices",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-slate-500">
                    <Circle className="h-4 w-4 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* § 6 — TESTIMONIALS                                                 */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section id="testimonials" className="py-24 px-4 sm:px-6 bg-slate-900/40">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest mb-4">
              <Star className="h-3 w-3" />Social Proof
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">Coaches Love SquadCraft</h2>
            <p className="text-slate-400 max-w-lg mx-auto text-sm leading-relaxed">
              Trusted by youth academies and amateur clubs across Europe and beyond.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, role, rating, quote }) => {
              const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2);
              return (
                <div key={name} className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md flex flex-col">
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: rating }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 text-amber-400" fill="currentColor" />
                    ))}
                  </div>
                  <blockquote className="text-sm text-slate-400 italic leading-relaxed flex-1">
                    &ldquo;{quote}&rdquo;
                  </blockquote>
                  <div className="flex items-center gap-3 mt-5 pt-4 border-t border-slate-800/60">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-400 flex items-center justify-center text-xs font-black text-white shrink-0">
                      {initials}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-200">{name}</div>
                      <div className="text-[10px] text-slate-500">{role}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* § 7 — BLOG                                                          */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section id="blog" className="py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest mb-3">
                <BookOpen className="h-3 w-3" />Coaching Blog
              </div>
              <h2 className="text-3xl font-black text-white">Tactics & Insights</h2>
            </div>
            <a href="#blog" className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors shrink-0">
              All Articles <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {BLOG_POSTS.map(({ tag, title, date, read }) => {
              const tagColor = tag === "Tactics" ? "text-rose-400 bg-rose-500/10 border-rose-500/30"
                : tag === "Analytics" ? "text-amber-400 bg-amber-500/10 border-amber-500/30"
                : "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
              return (
                <a key={title} href="#blog"
                  className="group bg-slate-900 border border-slate-800 hover:border-emerald-700/40 rounded-xl overflow-hidden shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col"
                >
                  {/* Placeholder graphic */}
                  <div className="h-36 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 flex flex-col opacity-[0.06]">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className={`flex-1 ${i % 2 === 0 ? "bg-emerald-400" : ""}`} />
                      ))}
                    </div>
                    <Activity className="h-10 w-10 text-slate-700 group-hover:text-emerald-700 transition-colors" />
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border w-fit mb-3 ${tagColor}`}>{tag}</span>
                    <h3 className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 transition-colors leading-snug flex-1">{title}</h3>
                    <div className="flex items-center gap-3 mt-4 pt-3 border-t border-slate-800/60 text-[10px] text-slate-600">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{read} read</span>
                      <span>{date}</span>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* § 8 — FAQ                                                           */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section id="faq" className="py-24 px-4 sm:px-6 bg-slate-900/40">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest mb-4">
              <TrendingUp className="h-3 w-3" />FAQ
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-400 max-w-md mx-auto text-sm leading-relaxed">
              Everything you need to know before signing your first player.
            </p>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq) => <FaqItem key={faq.q} {...faq} />)}
          </div>
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              Still have questions?{" "}
              <a href="mailto:support@squadcraft.io" className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors">
                Contact our team →
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* § 9 — NEWSLETTER                                                    */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section id="newsletter" className="py-24 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-700/30 rounded-2xl p-10 shadow-2xl shadow-emerald-950/40 text-center relative overflow-hidden">
            <div className="absolute inset-0 flex flex-col opacity-[0.04] pointer-events-none">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className={`flex-1 ${i % 2 === 0 ? "bg-emerald-300" : ""}`} />
              ))}
            </div>
            <div className="relative z-10">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl w-fit mx-auto mb-5">
                <Send className="h-6 w-6 text-emerald-400" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">Stay Ahead of the Whistle</h2>
              <p className="text-sm text-slate-400 mb-7 max-w-md mx-auto leading-relaxed">
                Get monthly coaching tips, product updates, tactical breakdowns, and SquadCraft feature announcements delivered to your inbox.
              </p>

              {subscribed ? (
                <div className="flex items-center justify-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl py-4 px-6 font-bold text-sm">
                  <CheckCircle className="h-5 w-5" /> You&apos;re subscribed — welcome to the team!
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); if (email.trim()) { setSubscribed(true); setEmail(""); } }}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 text-sm font-medium focus:outline-none transition-colors"
                    placeholder="Enter your club email..."
                  />
                  <button type="submit"
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 text-sm whitespace-nowrap"
                  >
                    <Send className="h-4 w-4" /> Subscribe
                  </button>
                </form>
              )}
              <p className="text-[10px] text-slate-600 mt-4">No spam. Unsubscribe at any time. We respect your privacy.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* § 10 — CTA BANNER                                                  */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section id="cta" className="py-20 px-4 sm:px-6 bg-slate-900/50 border-y border-slate-800">
        <div className="max-w-4xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-3">
              Ready to Take Control<br />
              <span className="text-emerald-400">of Your Squad?</span>
            </h2>
            <p className="text-slate-400 text-sm max-w-lg leading-relaxed">
              Join thousands of coaches already using SquadCraft. No setup fees, no credit card required. Your full dashboard is live within minutes.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            {user ? (
              <Link href="/dashboard"
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold px-7 py-3.5 rounded-xl transition-all shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 text-sm"
              >
                Go to Dashboard <LayoutDashboard className="h-4 w-4" />
              </Link>
            ) : (
              <button onClick={() => setShowModal(true)}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold px-7 py-3.5 rounded-xl transition-all shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 text-sm"
              >
                Get Started Free <ArrowRight className="h-4 w-4" />
              </button>
            )}
            <a href="mailto:support@squadcraft.io"
              className="flex items-center justify-center gap-2 bg-slate-800/60 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white font-bold px-7 py-3.5 rounded-xl transition-all text-sm"
            >
              <Mail className="h-4 w-4" /> Talk to Sales
            </a>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* FOOTER                                                              */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <footer id="contact" className="bg-slate-950 border-t border-slate-800 pt-16 pb-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Top grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">

            {/* Brand column */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="bg-gradient-to-br from-emerald-600 to-emerald-400 p-2 rounded-xl shadow-md shadow-emerald-500/20">
                  <Activity className="h-4 w-4 text-white" />
                </div>
                <span className="text-base font-black text-white uppercase tracking-tight">
                  Squad<span className="text-emerald-400">Craft</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-5">
                The complete digital toolkit for football clubs and sports academies. Lineups, analytics, attendance, and notices — all in one platform.
              </p>
              {/* Social links */}
              <div className="flex gap-2">
                {[
                  { Icon: MessageCircle, href: "https://twitter.com",   label: "Twitter" },
                  { Icon: Code,          href: "https://github.com",    label: "GitHub" },
                  { Icon: Briefcase,     href: "https://linkedin.com",  label: "LinkedIn" },
                  { Icon: Camera,        href: "https://instagram.com", label: "Instagram" },
                ].map(({ Icon, href, label }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                    className="w-8 h-8 flex items-center justify-center bg-slate-800 hover:bg-emerald-500/10 border border-slate-700 hover:border-emerald-500/30 rounded-lg text-slate-500 hover:text-emerald-400 transition-all"
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Navigation</h4>
              <ul className="space-y-2.5">
                {[
                  { label: "Home",          href: "#hero" },
                  { label: "Features",      href: "#features" },
                  { label: "How It Works",  href: "#how-it-works" },
                  { label: "Testimonials",  href: "#testimonials" },
                  { label: "Blog",          href: "#blog" },
                  { label: "FAQ",           href: "#faq" },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <a href={href} onClick={(e) => { e.preventDefault(); scrollTo(href.replace("#", "")); }}
                      className="text-xs text-slate-500 hover:text-emerald-400 transition-colors font-medium"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Platform */}
            <div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Platform</h4>
              <ul className="space-y-2.5">
                {[
                  { label: "Dashboard",        href: "#" },
                  { label: "Lineup Builder",   href: "#" },
                  { label: "Player Roster",    href: "#" },
                  { label: "Attendance",       href: "#" },
                  { label: "Analytics",        href: "#" },
                  { label: "Notice Board",     href: "#" },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <a href={href} onClick={(e) => { e.preventDefault(); setShowModal(true); }}
                      className="text-xs text-slate-500 hover:text-emerald-400 transition-colors font-medium flex items-center gap-1.5 group"
                    >
                      {label}
                      <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Contact</h4>
              <ul className="space-y-3">
                {[
                  { Icon: Mail,   text: "support@squadcraft.io", href: "mailto:support@squadcraft.io" },
                  { Icon: Phone,  text: "+44 20 7946 0958",       href: "tel:+442079460958" },
                  { Icon: MapPin, text: "London, United Kingdom", href: "https://maps.google.com/?q=London,UK" },
                ].map(({ Icon, text, href }) => (
                  <li key={text}>
                    <a href={href} target="_blank" rel="noopener noreferrer"
                      className="flex items-start gap-2.5 text-xs text-slate-500 hover:text-emerald-400 transition-colors group"
                    >
                      <Icon className="h-4 w-4 shrink-0 mt-0.5 group-hover:text-emerald-400 transition-colors" />
                      {text}
                    </a>
                  </li>
                ))}
              </ul>

              <div className="mt-6 bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">System Status</span>
                </div>
                <p className="text-xs font-bold text-emerald-400">All systems operational</p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-[11px] text-slate-600">
              © {new Date().getFullYear()} SquadCraft Sports Management Platform. All rights reserved.
            </p>
            <div className="flex gap-4 text-[11px] text-slate-600">
              <a href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-emerald-400 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-emerald-400 transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Global keyframes (injected as style tag) */}
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeSlideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes bounceY {
          0%, 100% { transform: translate(-50%, 0); }
          50%       { transform: translate(-50%, 6px); }
        }
      `}</style>
    </div>
  );
}
