"use client";

import { useState } from "react";
import { Notice } from "../lib/types";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Megaphone, Calendar, Trash2, Plus, X, MessageSquare, AlertCircle } from "lucide-react";

interface NoticeBoardProps {
  notices: Notice[];
  onRefresh: () => void;
}

const CATEGORY_STYLES: Record<string, { badge: string; ring: string }> = {
  Match:    { badge: "bg-rose-500/15 text-rose-400 border-rose-500/30",    ring: "hover:border-rose-700/40" },
  Training: { badge: "bg-amber-500/15 text-amber-400 border-amber-500/30",  ring: "hover:border-amber-700/40" },
  General:  { badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", ring: "hover:border-emerald-700/40" },
};

const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      month: "short", day: "numeric", year: "numeric",
    });
  } catch { return dateStr; }
};

export default function NoticeBoard({ notices, onRefresh }: NoticeBoardProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";

  const [filterCat, setFilterCat] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<"Match" | "Training" | "General">("General");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const openModal = () => {
    setTitle(""); setContent(""); setCategory("General"); setError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) { setError("Title and content are required."); return; }
    setLoading(true); setError("");
    try {
      await api.post("/notices", { title, content, category });
      setIsModalOpen(false);
      onRefresh();
    } catch { setError("Failed to post notice. Check server connection."); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this notice?")) return;
    try { await api.delete(`/notices/${id}`); onRefresh(); }
    catch { alert("Failed to delete notice."); }
  };

  const filtered = filterCat === "All" ? notices : notices.filter((n) => n.category === filterCat);

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md">
        <div className="flex gap-2 flex-wrap">
          {["All", "General", "Match", "Training"].map((cat) => (
            <button key={cat} onClick={() => setFilterCat(cat)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                filterCat === cat
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/40"
                  : "bg-slate-950 text-slate-400 border-slate-700 hover:border-slate-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        {isAdmin && (
          <button onClick={openModal}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-900/30 text-sm"
          >
            <Plus className="h-4 w-4" />
            Create Notice
          </button>
        )}
      </div>

      {/* Notices Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-900 border border-slate-800 rounded-xl shadow-md">
          <Megaphone className="h-10 w-10 text-slate-600 mb-4" />
          <h3 className="text-base font-bold text-slate-300">No notices</h3>
          <p className="text-xs text-slate-500 mt-1">Club announcements will appear here once posted.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((notice) => {
            const styles = CATEGORY_STYLES[notice.category] || CATEGORY_STYLES["General"];
            return (
              <div key={notice._id}
                className={`flex flex-col justify-between bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg ${styles.ring}`}
              >
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${styles.badge}`}>
                      {notice.category}
                    </span>
                    {isAdmin && (
                      <button onClick={() => handleDelete(notice._id)}
                        className="p-1.5 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Delete notice"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-slate-100 leading-snug mb-2">{notice.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">{notice.content}</p>
                </div>
                <div className="flex items-center gap-1.5 mt-5 pt-4 border-t border-slate-800/60 text-[11px] text-slate-600">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(notice.createdAt)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Notice Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-emerald-400" />
                Publish Announcement
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
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Title</label>
                <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500 text-sm"
                  placeholder="e.g., Tactical Briefing — Sunday Match"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Category</label>
                <div className="grid grid-cols-3 gap-3">
                  {(["General", "Match", "Training"] as const).map((cat) => (
                    <button key={cat} type="button" onClick={() => setCategory(cat)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        category === cat
                          ? cat === "Match" ? "bg-rose-500/10 text-rose-400 border-rose-500/40"
                          : cat === "Training" ? "bg-amber-500/10 text-amber-400 border-amber-500/40"
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/40"
                          : "bg-slate-950 text-slate-500 border-slate-700"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Details</label>
                <textarea required rows={5} value={content} onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500 resize-none text-sm"
                  placeholder="Enter full notice details, instructions, and requirements..."
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
                  {loading ? "Posting..." : "Publish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
