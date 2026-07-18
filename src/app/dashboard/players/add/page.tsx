"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../context/AuthContext";
import { Loader2, UserCircle, Target, FileText, Activity, Image as ImageIcon, Save, AlertCircle, CheckCircle2 } from "lucide-react";
import Navbar from "../../../../components/navbar/Navbar";

export default function AddPlayerPage() {
  const router = useRouter();
  const auth = useAuth?.() || { user: null, isLoading: false };
  const { user, isLoading: authLoading } = auth;
  
  const [isPageReady, setIsPageReady] = useState(false);

  // Form State
  const [playerName, setPlayerName] = useState("");
  const [role, setRole] = useState("");
  const [biography, setBiography] = useState("");
  const [performanceScore, setPerformanceScore] = useState<string>("");
  const [imageUrl, setImageUrl] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Route Protection & Authentication Check
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else {
        setIsPageReady(true);
      }
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || !role.trim()) {
      setError("Player Name and Tactical Role are required.");
      return;
    }
    
    setError("");
    setSuccess(false);
    setIsSubmitting(true);

    // Simulate API POST call to backend
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      // Reset form after successful submission
      setSuccess(true);
      setPlayerName("");
      setRole("");
      setBiography("");
      setPerformanceScore("");
      setImageUrl("");
      
      // Hide success message after a delay
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("An unexpected error occurred while adding the player.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Do not render form or sensitive UI until authentication state is validated
  if (!isPageReady || authLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center font-sans">
        <Loader2 className="h-10 w-10 text-emerald-500 animate-spin mb-4" />
        <p className="text-neutral-400 font-medium animate-pulse">Verifying credentials...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col text-neutral-300 font-sans selection:bg-emerald-500/30">
      <Navbar />

      <main className="flex-1 flex justify-center p-4 py-12 relative overflow-hidden">
        {/* Deep Football Green & Emerald Accents */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-900/30 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-emerald-700/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="w-full max-w-2xl relative z-10">
          <div className="bg-neutral-900/90 backdrop-blur-xl border border-neutral-800 rounded-xl p-8 sm:p-10 shadow-[0_8px_40px_rgb(0,0,0,0.3)]">
            
            {/* Header */}
            <div className="mb-8 border-b border-neutral-800 pb-6">
              <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                <UserCircle className="h-8 w-8 text-emerald-500" />
                Add New Player
              </h1>
              <p className="text-sm text-neutral-400 mt-2">
                Register a new squad member to your team roster. Fill out the details below to add them to your active database.
              </p>
            </div>

            {/* Notifications */}
            {error && (
              <div className="mb-6 p-4 bg-red-950/40 border border-red-900/50 rounded-xl flex items-start gap-3 animate-in fade-in zoom-in-95 duration-200">
                <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-red-400">{error}</p>
              </div>
            )}
            
            {success && (
              <div className="mb-6 p-4 bg-emerald-950/40 border border-emerald-900/50 rounded-xl flex items-start gap-3 animate-in fade-in zoom-in-95 duration-200">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-emerald-400">Player profile created and added to the squad!</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title / Player Name */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider ml-1">Player Name <span className="text-red-500">*</span></label>
                  <div className="relative group">
                    <UserCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                      type="text"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl pl-11 pr-4 py-3.5 text-neutral-100 placeholder-neutral-600 focus:outline-none transition-all text-sm font-medium focus:border-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0)] focus:shadow-[0_0_0_2px_rgba(16,185,129,0.15)] hover:border-neutral-700"
                      placeholder="e.g. Lionel Messi"
                      required
                    />
                  </div>
                </div>

                {/* Short Description / Tactical Role */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider ml-1">Tactical Role <span className="text-red-500">*</span></label>
                  <div className="relative group">
                    <Target className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl pl-11 pr-4 py-3.5 text-neutral-100 placeholder-neutral-600 focus:outline-none transition-all text-sm font-medium focus:border-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0)] focus:shadow-[0_0_0_2px_rgba(16,185,129,0.15)] hover:border-neutral-700"
                      placeholder="e.g. Attacking Midfielder"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Full Description / Biography */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider ml-1">Detailed Biography</label>
                <div className="relative group">
                  <FileText className="absolute left-3.5 top-4 h-5 w-5 text-neutral-500 group-focus-within:text-emerald-500 transition-colors" />
                  <textarea
                    value={biography}
                    onChange={(e) => setBiography(e.target.value)}
                    rows={4}
                    className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl pl-11 pr-4 py-3.5 text-neutral-100 placeholder-neutral-600 focus:outline-none transition-all text-sm font-medium focus:border-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0)] focus:shadow-[0_0_0_2px_rgba(16,185,129,0.15)] hover:border-neutral-700 resize-y"
                    placeholder="Provide detailed career background, key strengths, and history..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Numerical Field / Performance Score */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider ml-1">Performance Score (0-100)</label>
                  <div className="relative group">
                    <Activity className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={performanceScore}
                      onChange={(e) => setPerformanceScore(e.target.value)}
                      className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl pl-11 pr-4 py-3.5 text-neutral-100 placeholder-neutral-600 focus:outline-none transition-all text-sm font-medium focus:border-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0)] focus:shadow-[0_0_0_2px_rgba(16,185,129,0.15)] hover:border-neutral-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="e.g. 94"
                    />
                  </div>
                </div>

                {/* Optional Image URL */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider ml-1">Profile Portrait URL (Optional)</label>
                  <div className="relative group">
                    <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl pl-11 pr-4 py-3.5 text-neutral-100 placeholder-neutral-600 focus:outline-none transition-all text-sm font-medium focus:border-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0)] focus:shadow-[0_0_0_2px_rgba(16,185,129,0.15)] hover:border-neutral-700"
                      placeholder="https://example.com/portrait.jpg"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Actions */}
              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full md:w-auto px-10 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.35)] text-sm disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                  {isSubmitting ? "Processing..." : "Save Player Profile"}
                </button>
              </div>
            </form>
            
          </div>
        </div>
      </main>
    </div>
  );
}
