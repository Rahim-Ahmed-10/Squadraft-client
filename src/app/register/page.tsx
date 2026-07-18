"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";
import { Shield, Mail, Lock, UserPlus, Chrome, Loader2, AlertCircle, User as UserIcon } from "lucide-react";
import Navbar from "../../../components/navbar/Navbar";

export default function RegisterPage() {
  const router = useRouter();
  const { register, user, isLoading: authLoading } = useAuth();
  
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [errors, setErrors] = useState<{ fullName?: string; email?: string; password?: string; confirmPassword?: string; general?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  const validate = () => {
    const newErrors: typeof errors = {};
    
    if (!fullName.trim()) {
      newErrors.fullName = "Full Name is required";
    }

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    if (confirmPassword !== password) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      setErrors({});
      await register(email.toLowerCase(), password, "Admin");
      router.push("/dashboard");
    } catch (err: any) {
      setErrors({ general: err.response?.data?.message || "Failed to create account" });
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    setTimeout(() => {
      setErrors({ general: "Google authentication is not configured." });
      setIsGoogleLoading(false);
    }, 1500);
  };

  if (authLoading) return <div className="min-h-screen bg-neutral-950 flex items-center justify-center"><Loader2 className="h-8 w-8 text-emerald-500 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col text-neutral-300 font-sans selection:bg-emerald-500/30">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 py-12 relative overflow-hidden">
        {/* Deep Football Green & Amber Accents */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-900/40 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          <div className="bg-neutral-900/80 backdrop-blur-xl border border-neutral-800 rounded-xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
            
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center p-3 bg-emerald-900/30 border border-emerald-800/50 rounded-2xl mb-4 shadow-inner shadow-emerald-500/10">
                <Shield className="h-8 w-8 text-emerald-500" />
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Create Account</h1>
              <p className="text-sm text-neutral-400 mt-2">Join SquadCraft and manage your club</p>
            </div>

            {/* General Error */}
            {errors.general && (
              <div className="mb-6 p-3 bg-red-950/40 border border-red-900/50 rounded-lg flex items-start gap-2.5 animate-in fade-in zoom-in-95 duration-200">
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-red-400">{errors.general}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleRegister} className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Full Name</label>
                <div className="relative group">
                  <UserIcon className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 transition-colors ${errors.fullName ? "text-red-500" : "text-neutral-500 group-focus-within:text-emerald-500"}`} />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => { setFullName(e.target.value); if(errors.fullName) setErrors({...errors, fullName: undefined}); }}
                    className={`w-full bg-neutral-950/50 border rounded-xl pl-10 pr-4 py-3 text-neutral-100 placeholder-neutral-600 focus:outline-none transition-all text-sm font-medium ${
                      errors.fullName ? "border-red-500/50 focus:border-red-500 shadow-[0_0_0_2px_rgba(239,68,68,0.1)]" : "border-neutral-800 focus:border-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0)] focus:shadow-[0_0_0_2px_rgba(16,185,129,0.1)] hover:border-neutral-700"
                    }`}
                    placeholder="Sujan Doe"
                  />
                </div>
                {errors.fullName && <p className="text-[12px] font-medium text-red-400 flex items-center gap-1.5 mt-1.5 animate-in slide-in-from-top-1"><AlertCircle className="h-3.5 w-3.5" /> {errors.fullName}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Email Address</label>
                <div className="relative group">
                  <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 transition-colors ${errors.email ? "text-red-500" : "text-neutral-500 group-focus-within:text-emerald-500"}`} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if(errors.email) setErrors({...errors, email: undefined}); }}
                    className={`w-full bg-neutral-950/50 border rounded-xl pl-10 pr-4 py-3 text-neutral-100 placeholder-neutral-600 focus:outline-none transition-all text-sm font-medium ${
                      errors.email ? "border-red-500/50 focus:border-red-500 shadow-[0_0_0_2px_rgba(239,68,68,0.1)]" : "border-neutral-800 focus:border-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0)] focus:shadow-[0_0_0_2px_rgba(16,185,129,0.1)] hover:border-neutral-700"
                    }`}
                    placeholder="manager@brothersfc.com"
                  />
                </div>
                {errors.email && <p className="text-[12px] font-medium text-red-400 flex items-center gap-1.5 mt-1.5 animate-in slide-in-from-top-1"><AlertCircle className="h-3.5 w-3.5" /> {errors.email}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Password</label>
                <div className="relative group">
                  <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 transition-colors ${errors.password ? "text-red-500" : "text-neutral-500 group-focus-within:text-emerald-500"}`} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); if(errors.password) setErrors({...errors, password: undefined}); }}
                    className={`w-full bg-neutral-950/50 border rounded-xl pl-10 pr-4 py-3 text-neutral-100 placeholder-neutral-600 focus:outline-none transition-all text-sm font-medium ${
                      errors.password ? "border-red-500/50 focus:border-red-500 shadow-[0_0_0_2px_rgba(239,68,68,0.1)]" : "border-neutral-800 focus:border-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0)] focus:shadow-[0_0_0_2px_rgba(16,185,129,0.1)] hover:border-neutral-700"
                    }`}
                    placeholder="••••••••"
                  />
                </div>
                {errors.password && <p className="text-[12px] font-medium text-red-400 flex items-center gap-1.5 mt-1.5 animate-in slide-in-from-top-1"><AlertCircle className="h-3.5 w-3.5" /> {errors.password}</p>}
              </div>

              <div className="space-y-1.5 mb-2">
                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Confirm Password</label>
                <div className="relative group">
                  <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 transition-colors ${errors.confirmPassword ? "text-red-500" : "text-neutral-500 group-focus-within:text-emerald-500"}`} />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); if(errors.confirmPassword) setErrors({...errors, confirmPassword: undefined}); }}
                    className={`w-full bg-neutral-950/50 border rounded-xl pl-10 pr-4 py-3 text-neutral-100 placeholder-neutral-600 focus:outline-none transition-all text-sm font-medium ${
                      errors.confirmPassword ? "border-red-500/50 focus:border-red-500 shadow-[0_0_0_2px_rgba(239,68,68,0.1)]" : "border-neutral-800 focus:border-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0)] focus:shadow-[0_0_0_2px_rgba(16,185,129,0.1)] hover:border-neutral-700"
                    }`}
                    placeholder="••••••••"
                  />
                </div>
                {errors.confirmPassword && <p className="text-[12px] font-medium text-red-400 flex items-center gap-1.5 mt-1.5 animate-in slide-in-from-top-1"><AlertCircle className="h-3.5 w-3.5" /> {errors.confirmPassword}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.3)] text-sm disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98] mt-4"
              >
                {isSubmitting ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <UserPlus className="h-4.5 w-4.5" />}
                {isSubmitting ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-neutral-800/80 space-y-3">
              {/* Social Login */}
              <button
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading || isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-white hover:bg-neutral-100 text-neutral-900 border border-transparent font-semibold py-3 rounded-xl transition-all text-sm shadow-sm disabled:opacity-70 active:scale-[0.98]"
              >
                {isGoogleLoading ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <Chrome className="h-4.5 w-4.5 text-blue-600" />}
                Sign up with Google
              </button>
            </div>

            <p className="text-center text-sm text-neutral-400 font-medium mt-8">
              Already have an account?{" "}
              <Link href="/login" className="text-emerald-500 hover:text-emerald-400 font-semibold transition-colors">
                Sign in
              </Link>
            </p>

          </div>
        </div>
      </main>
    </div>
  );
}
