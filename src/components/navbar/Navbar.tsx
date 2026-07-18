"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import {
  Activity,
  Menu,
  X,
  LayoutDashboard,
  Trophy,
  Users,
  BarChart2,
  UserCircle,
  LogOut,
  Home,
  Shield,
  Mail,
  ChevronRight,
  LogIn,
  Zap,
} from "lucide-react";

// ── Type Definitions ──────────────────────────────────────────────────────────

interface NavLink {
  label: string;
  href: string;
  Icon: React.ElementType;
  description?: string;
}

interface NavbarProps {
  /** Callback for when a logged-in user clicks a dashboard tab link */
  onTabChange?: (tab: string) => void;
  /** Callback to trigger login modal/scroll from landing page */
  onLoginClick?: () => void;
  /** Indicates if Navbar is rendered within the dashboard */
  isDashboard?: boolean;
}

// ── Nav Link Config ───────────────────────────────────────────────────────────

const PUBLIC_LINKS: NavLink[] = [
  { label: "Home",        href: "#hero",     Icon: Home,         description: "Back to top" },
  { label: "About",       href: "#about",    Icon: Shield,       description: "About SquadCraft" },
  { label: "Features",    href: "#features", Icon: Zap,          description: "What we offer" },
  { label: "Contact",     href: "#contact",  Icon: Mail,         description: "Get in touch" },
];

const PRIVATE_LINKS: (NavLink & { tab: string })[] = [
  { label: "Dashboard",    href: "#",  tab: "overview",    Icon: LayoutDashboard, description: "Club overview" },
  { label: "Squad Builder",href: "#",  tab: "lineup",      Icon: Trophy,          description: "Set formations" },
  { label: "Players",      href: "#",  tab: "roster",      Icon: Users,           description: "Player roster" },
  { label: "Analytics",    href: "#",  tab: "analytics",   Icon: BarChart2,       description: "Performance data" },
  { label: "Profile",      href: "#",  tab: "profile",     Icon: UserCircle,      description: "Your profile" },
];

// ── Utility ───────────────────────────────────────────────────────────────────

const scrollToSection = (href: string) => {
  if (href === "#" || !href.startsWith("#")) return;
  const el = document.querySelector(href);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};

// ── Navbar Component ──────────────────────────────────────────────────────────

export default function Navbar({ onTabChange, onLoginClick, isDashboard }: NavbarProps) {
  const { user, logout } = useAuth();
  const isLoggedIn = !!user;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  // Scroll shadow & section tracking
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);

      // Track active section via IntersectionObserver substitute
      const sections = ["hero", "about", "features", "contact"];
      for (const id of sections.reverse()) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 100) {
          setActiveSection(id);
          break;
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close drawer on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setIsMenuOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMenuOpen]);

  const handlePublicLinkClick = useCallback((href: string) => {
    scrollToSection(href);
    setIsMenuOpen(false);
  }, []);

  const handlePrivateLinkClick = useCallback((tab: string) => {
    onTabChange?.(tab);
    setIsMenuOpen(false);
  }, [onTabChange]);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const handleLoginClick = () => {
    onLoginClick?.();
    setIsMenuOpen(false);
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Top Bar ──────────────────────────────────────────────────────────── */}
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? "bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/80 shadow-lg shadow-black/20"
            : "bg-slate-950/80 backdrop-blur-md border-b border-slate-800/40"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">

            {/* ── Logo ──────────────────────────────────────────────────────── */}
            <Link
              href="/"
              onClick={(e) => {
                if (!isDashboard) {
                  e.preventDefault();
                  handlePublicLinkClick("#hero");
                }
              }}
              className="flex items-center gap-2.5 group shrink-0"
            >
              <div className="bg-gradient-to-br from-emerald-600 to-emerald-400 p-2 rounded-xl shadow-md shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div className="leading-none">
                <span className="text-base font-black tracking-tight text-white uppercase">
                  Squad<span className="text-emerald-400">Craft</span>
                </span>
                <span className="block text-[9px] font-bold text-slate-500 tracking-widest uppercase">
                  Sports Management
                </span>
              </div>
            </Link>

            {/* ── Desktop Nav Links ─────────────────────────────────────────── */}
            <nav className="hidden md:flex items-center gap-1">
              {isLoggedIn
                ? isDashboard
                  ? PRIVATE_LINKS.map(({ label, tab, Icon }) => (
                      <button
                        key={tab}
                        onClick={() => handlePrivateLinkClick(tab)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/8 transition-all duration-150 group"
                      >
                        <Icon className="h-3.5 w-3.5 group-hover:scale-110 transition-transform duration-150" />
                        {label}
                      </button>
                    ))
                  : <Link href="/dashboard" className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/8 transition-all duration-150 group">
                      <LayoutDashboard className="h-3.5 w-3.5 group-hover:scale-110 transition-transform duration-150" />
                      Dashboard
                    </Link>
                : PUBLIC_LINKS.map(({ label, href, Icon }) => {
                    const sectionId = href.replace("#", "");
                    const isActive = activeSection === sectionId;
                    return (
                      <a
                        key={href}
                        href={href}
                        onClick={(e) => { e.preventDefault(); handlePublicLinkClick(href); }}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-150 group ${
                          isActive
                            ? "text-emerald-400 bg-emerald-500/10"
                            : "text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/8"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5 group-hover:scale-110 transition-transform duration-150" />
                        {label}
                      </a>
                    );
                  })}
            </nav>

            {/* ── Desktop CTA ───────────────────────────────────────────────── */}
            <div className="hidden md:flex items-center gap-3">
              {isLoggedIn ? (
                <>
                  {/* User pill */}
                  <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 px-3.5 py-1.5 rounded-xl">
                    <div className={`w-2 h-2 rounded-full ${user.role === "Admin" ? "bg-amber-400" : "bg-emerald-400"} animate-pulse`} />
                    <span className="text-xs font-bold text-slate-300 capitalize">{user.username}</span>
                    <span className={`text-[9px] font-black uppercase border px-1.5 py-0.5 rounded-full ${
                      user.role === "Admin"
                        ? "text-amber-400 border-amber-500/30 bg-amber-500/10"
                        : "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                    }`}>
                      {user.role}
                    </span>
                  </div>

                  {/* Go to Dashboard or Sign Out */}
                  {!isDashboard && (
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 border border-slate-700 hover:border-emerald-500/30 transition-all duration-150"
                    >
                      <LayoutDashboard className="h-3.5 w-3.5" />
                      Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-700 hover:border-rose-500/30 transition-all duration-150"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleLoginClick}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-slate-200 border border-slate-700 hover:border-slate-600 bg-slate-800/60 transition-all duration-150"
                  >
                    <LogIn className="h-3.5 w-3.5" />
                    Sign In
                  </button>
                  <button
                    onClick={handleLoginClick}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold px-4 py-2 rounded-xl text-sm transition-all shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30"
                  >
                    Get Started
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
            </div>

            {/* ── Mobile Hamburger ──────────────────────────────────────────── */}
            <button
              onClick={() => setIsMenuOpen((v) => !v)}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 transition-all"
              aria-label="Toggle navigation menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Drawer Overlay ─────────────────────────────────────────────── */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Mobile Navigation Drawer ──────────────────────────────────────────── */}
      <div
        className={`fixed top-16 right-0 bottom-0 z-40 w-80 max-w-[90vw] bg-slate-900 border-l border-slate-800 shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden flex flex-col ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {isLoggedIn ? "Navigation" : "Menu"}
            </p>
            {isLoggedIn && (
              <p className="text-xs text-slate-500 mt-0.5">
                Signed in as <span className="text-emerald-400 font-semibold">{user.username}</span>
              </p>
            )}
          </div>
          {isLoggedIn && (
            <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
              user.role === "Admin"
                ? "text-amber-400 border-amber-500/30 bg-amber-500/10"
                : "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
            }`}>
              {user.role}
            </div>
          )}
        </div>

        {/* Drawer Links */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
          {isLoggedIn
            ? isDashboard
              ? PRIVATE_LINKS.map(({ label, tab, Icon, description }) => (
                  <button
                    key={tab}
                    onClick={() => handlePrivateLinkClick(tab)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-emerald-400 hover:bg-emerald-500/8 border border-transparent hover:border-emerald-500/15 transition-all group text-left"
                  >
                    <div className="p-1.5 bg-slate-800 group-hover:bg-emerald-500/10 rounded-lg text-slate-500 group-hover:text-emerald-400 border border-slate-700 group-hover:border-emerald-500/20 transition-all shrink-0">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold">{label}</div>
                      {description && (
                        <div className="text-[11px] text-slate-600 font-normal mt-0.5">{description}</div>
                      )}
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 ml-auto text-slate-600 group-hover:text-emerald-400 shrink-0 transition-colors" />
                  </button>
                ))
              : <Link href="/dashboard" className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-emerald-400 hover:bg-emerald-500/8 border border-transparent hover:border-emerald-500/15 transition-all group text-left">
                  <div className="p-1.5 bg-slate-800 group-hover:bg-emerald-500/10 rounded-lg text-slate-500 group-hover:text-emerald-400 border border-slate-700 group-hover:border-emerald-500/20 transition-all shrink-0">
                    <LayoutDashboard className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold">Dashboard</div>
                    <div className="text-[11px] text-slate-600 font-normal mt-0.5">Go to your club dashboard</div>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 ml-auto text-slate-600 group-hover:text-emerald-400 shrink-0 transition-colors" />
                </Link>
            : PUBLIC_LINKS.map(({ label, href, Icon, description }) => {
                const sectionId = href.replace("#", "");
                const isActive = activeSection === sectionId;
                return (
                  <a
                    key={href}
                    href={href}
                    onClick={(e) => { e.preventDefault(); handlePublicLinkClick(href); }}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold border transition-all group ${
                      isActive
                        ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                        : "text-slate-300 hover:text-emerald-400 hover:bg-emerald-500/8 border-transparent hover:border-emerald-500/15"
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg border shrink-0 transition-all ${
                      isActive
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-slate-800 text-slate-500 border-slate-700 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 group-hover:border-emerald-500/20"
                    }`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold">{label}</div>
                      {description && (
                        <div className="text-[11px] text-slate-600 font-normal mt-0.5">{description}</div>
                      )}
                    </div>
                    <ChevronRight className={`h-3.5 w-3.5 ml-auto shrink-0 ${isActive ? "text-emerald-400" : "text-slate-700"}`} />
                  </a>
                );
              })}
        </nav>

        {/* Drawer Footer CTA */}
        <div className="p-4 border-t border-slate-800 space-y-2.5 bg-slate-950/40">
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 bg-slate-800/60 hover:bg-rose-500/10 border border-slate-700 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 rounded-xl py-3 text-sm font-bold transition-all"
            >
              <LogOut className="h-4 w-4" />
              Sign Out of SquadCraft
            </button>
          ) : (
            <>
              <button
                onClick={handleLoginClick}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl py-3 text-sm font-bold transition-all shadow-md shadow-emerald-500/20"
              >
                <LogIn className="h-4 w-4" />
                Sign In / Get Started
              </button>
              <p className="text-center text-[10px] text-slate-600">
                Secure JWT authentication · Role-based access
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
}
