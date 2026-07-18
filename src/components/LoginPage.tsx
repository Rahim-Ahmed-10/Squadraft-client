"use client";

import { useState, FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { Activity, Eye, EyeOff, Shield, User, Lock, ArrowRight, Loader2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const { login, register } = useAuth();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"Admin" | "Player">("Player");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Username and password are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      if (mode === "login") {
        await login(username, password);
      } else {
        await register(username, password, role);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Authentication failed. Check credentials and server connection.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background field stripes */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex flex-col">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className={`flex-1 ${i % 2 === 0 ? "bg-emerald-400" : "bg-transparent"}`} />
        ))}
      </div>

      {/* Glow orbs */}
      <div className="absolute top-[-10%] left-[-5%] w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-400 p-3.5 rounded-2xl shadow-lg shadow-emerald-500/25 mb-4">
            <Activity className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white uppercase">
            Squad<span className="text-emerald-400">Craft</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-semibold tracking-wider uppercase">
            Sports Academy Management
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          {/* Tab switcher */}
          <div className="grid grid-cols-2 border-b border-slate-800">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); }}
                className={`py-4 text-sm font-bold uppercase tracking-widest transition-all ${
                  mode === m
                    ? "bg-emerald-500/10 text-emerald-400 border-b-2 border-emerald-500"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {m === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Error Banner */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm font-medium">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Demo credentials hint */}
            {mode === "login" && (
              <div className="p-3 bg-emerald-500/5 border border-emerald-500/15 rounded-xl text-xs text-slate-400 leading-relaxed">
                <span className="text-emerald-400 font-bold">Demo:</span>{" "}
                Admin → <code className="bg-slate-800 px-1.5 py-0.5 rounded font-mono text-emerald-300">coach_silva / admin1234</code>{" "}
                &nbsp;|&nbsp; Player → <code className="bg-slate-800 px-1.5 py-0.5 rounded font-mono text-amber-300">cian_osullivan / player1234</code>
              </div>
            )}

            {/* Username */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors text-sm font-medium"
                  placeholder="e.g. coach_silva"
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-12 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors text-sm font-medium"
                  placeholder="••••••••"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Role selector — only on register */}
            {mode === "register" && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Account Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(["Admin", "Player"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-bold transition-all ${
                        role === r
                          ? r === "Admin"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/40"
                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/40"
                          : "bg-slate-950 text-slate-500 border-slate-700 hover:border-slate-600"
                      }`}
                    >
                      <Shield className="h-4 w-4" />
                      {r === "Admin" ? "Coach / Admin" : "Player"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-60 text-sm mt-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
              {loading
                ? "Please wait..."
                : mode === "login"
                ? "Sign In to Dashboard"
                : "Create Account"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          SquadCraft © 2024 · Sports Academy Management Platform
        </p>
      </div>
    </div>
  );
}
