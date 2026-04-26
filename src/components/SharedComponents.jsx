import { X } from "lucide-react";
import { SKILL_STYLE } from "../data/personnel";

/* ─── SKILL BADGE ─────────────────────────────────────────────────────────── */
export const SkillBadge = ({ skill }) => {
  const st = SKILL_STYLE[skill] || { bg: "#1f2937", txt: "#9ca3af", dot: "#6b7280" };
  return (
    <span style={{ background: st.bg, color: st.txt }} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium">
      <span style={{ width: 5, height: 5, background: st.dot, borderRadius: "50%", display: "inline-block" }} />
      {skill}
    </span>
  );
};

/* ─── STATUS BADGE ────────────────────────────────────────────────────────── */
export const StatusBadge = ({ s }) => (
  <span
    className={`text-xs px-3 py-1 rounded-full font-semibold ${s === "Available" ? "text-green-400 border border-green-800" : "text-orange-400 border border-orange-800"}`}
    style={{ background: s === "Available" ? "rgba(21,128,61,.15)" : "rgba(154,52,18,.15)" }}
  >
    {s}
  </span>
);

/* ─── TOAST ───────────────────────────────────────────────────────────────── */
export const Toast = ({ msg, onClose }) => (
  <div className="fixed z-50 flex items-center gap-2 text-sm px-4 py-3 rounded-xl shadow-2xl fade-up"
    style={{ top: 16, right: 16, background: "#0d2a1a", border: "1px solid #15803d", color: "#86efac" }}>
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" stroke="#22c55e" strokeWidth="1.2" />
      <path d="M5 8l2 2 4-4" stroke="#22c55e" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    {msg}
    <button onClick={onClose} className="ml-1" style={{ color: "#4ade80", background: "none", border: "none", cursor: "pointer" }}>
      <X size={13} />
    </button>
  </div>
);

/* ─── PAGE HEADER ─────────────────────────────────────────────────────────── */
export const PageHeader = ({ icon: Icon, iconBg, title, subtitle, children }) => (
  <div className="flex items-center justify-between mb-6">
    <div className="flex items-center gap-4">
      <div style={{ width: 46, height: 46, borderRadius: 12, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={20} style={{ color: "#fff" }} />
      </div>
      <div>
        <h1 className="rj" style={{ fontWeight: 700, fontSize: 22, color: "#f0f4fa", letterSpacing: "0.02em" }}>{title}</h1>
        <p style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>{subtitle}</p>
      </div>
    </div>
    {children}
  </div>
);
