import { Activity, Shield, Users, BarChart2, Zap, TrendingUp } from "lucide-react";
import LiveClock from "./LiveClock";
import { useStore } from "../store";

const NAV = [
  { key: "dashboard", icon: BarChart2, label: "Command Center" },
  { key: "report", icon: Shield, label: "Report Incident" },
  { key: "personnel", icon: Users, label: "Personnel" },
  { key: "simulate", icon: Activity, label: "Simulate" },
  { key: "predict", icon: TrendingUp, label: "Predict" },
  { key: "priority", icon: Zap, label: "AI Priority" },
];

const Sidebar = ({ page, setPage, crisisMode }) => {
  const { predictionState } = useStore();
  const { predictions } = predictionState;

  const hasHighRiskPrediction = predictions.some(p => p.riskLevel === 'CRITICAL' || p.riskLevel === 'HIGH');

  return (
    <aside style={{
      width: 272, background: "#0a0e1a", borderRight: "1px solid #111827",
      display: "flex", flexDirection: "column", flexShrink: 0, height: "100vh",
      position: "sticky", top: 0,
      borderRightColor: crisisMode ? "rgba(239,68,68,0.15)" : "#111827",
      transition: "border-color 0.5s ease"
    }}>
      <div className="flex items-center gap-2 px-5 py-5" style={{ borderBottom: "1px solid #111827" }}>
        <div style={{
          width: 34, height: 34, background: crisisMode ? "#7f1d1d" : "#1d3557",
          borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 0.5s ease"
        }}>
          <Activity size={17} style={{ color: crisisMode ? "#f87171" : "#60a5fa" }} />
        </div>
        <span className="rj" style={{ fontWeight: 700, fontSize: 18, color: "#f0f4fa", letterSpacing: "0.02em" }}>
          Trana<span style={{ color: crisisMode ? "#ef4444" : "#3b82f6" }}>AI</span>
        </span>
      </div>
      <nav className="flex-1 px-3 py-4" style={{ overflowY: "auto" }}>
        {NAV.map(({ key, icon: Icon, label }) => {
          const active = page === key;
          const showBadge = key === 'predict' && hasHighRiskPrediction;

          return (
            <button key={key} onClick={() => setPage(key)}
              className="w-full flex items-center gap-3 px-3 rounded-xl mb-1 text-left transition-all micro-press"
              style={{
                background: active ? "rgba(59,130,246,.15)" : "transparent",
                color: active ? "#93c5fd" : "#6b7280",
                fontWeight: active ? 500 : 400, fontSize: 14,
                borderTop: "none", borderRight: "none", borderBottom: "none",
                borderLeft: active ? "3px solid #3b82f6" : "3px solid transparent",
                cursor: "pointer", padding: "10px 12px",
                borderRadius: 12, marginBottom: 4, display: "flex", alignItems: "center", gap: 12,
              }}>
              <Icon size={16} style={{ flexShrink: 0, color: active ? "#3b82f6" : "#4b5563" }} />
              <span style={{ flex: 1 }}>{label}</span>
              {showBadge && (
                <span className="pulse" style={{ width: 8, height: 8, borderRadius: "50%", background: "#f97316" }}></span>
              )}
            </button>
          );
        })}
      </nav>
      <div className="px-5 py-4" style={{ borderTop: "1px solid #111827" }}>
        <div className="flex items-center gap-2 mb-2">
          <span className="live-dot" />
          <span style={{ fontSize: 12, color: "#4b5563" }}>System Online · AI Active</span>
        </div>
        <LiveClock />
      </div>
    </aside>
  );
};

export default Sidebar;
