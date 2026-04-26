import { Activity, Zap, CheckCircle, BarChart2 } from "lucide-react";
import { useStore } from "../store";

export const CrisisBanner = () => {
  const { zones } = useStore();
  const critical = zones.filter(z => z.severity >= 8.5);
  if (critical.length === 0) return null;
  return (
    <div className="pulse" style={{ background: "#7f1d1d", color: "#fca5a5", padding: "8px 16px", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, fontSize: 13, fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, letterSpacing: "0.1em", zIndex: 100, borderBottom: "1px solid #991b1b" }}>
      <AlertTriangle size={14} />
      <span>CRISIS MODE ACTIVE: {critical.length} ZONES AT CRITICAL SEVERITY</span>
    </div>
  );
};
import { AlertTriangle } from "lucide-react";

export const CrisisOverlay = ({ active }) => (
  <div style={{
    position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999,
    background: "radial-gradient(circle at 50% 50%, transparent 60%, rgba(239,68,68,0.15) 100%)",
    opacity: active ? 1 : 0, transition: "opacity 1.5s ease"
  }} />
);

export const ImpactPanel = () => {
  // Calculate: lives_saved = total_resources * efficiency * severity_factor
  const { zones, personnel, aiAllocations } = useStore();
  
  const deployed = personnel.filter(p => p.status === "Deployed").length;
  const totalSev = zones.reduce((sum, z) => sum + z.severity, 0);
  const severityFactor = totalSev / zones.length;
  const efficiency = aiAllocations.length > 0 ? 0.95 : 0.65; // Base vs AI Optimized

  const livesSaved = Math.round(deployed * efficiency * severityFactor * 12);
  const responseEff = Math.round(efficiency * 100);
  const coverage = Math.min(100, Math.round((deployed / (zones.length * 2)) * 100));

  return (
    <div className="card-lift" style={{ background: "linear-gradient(135deg, #0f172a, #1e293b)", border: "1px solid #334155", borderRadius: 12, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899)" }} />
      <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: "1px solid #1e293b" }}>
        <Zap size={13} style={{ color: "#fbbf24" }} />
        <span style={{ fontSize: 10, letterSpacing: "0.1em", color: "#e2e8f0", fontFamily: "'Rajdhani',sans-serif", fontWeight: 700 }}>AI IMPACT METRICS</span>
      </div>
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        <div className="flex items-center justify-between">
          <div>
            <div style={{ fontSize: 24, fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, color: "#22c55e", lineHeight: 1 }}>{livesSaved.toLocaleString()}</div>
            <div style={{ fontSize: 10, color: "#9ca3af" }}>Est. Lives Saved</div>
          </div>
          <Activity size={24} style={{ color: "#22c55e", opacity: 0.2 }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div style={{ background: "#0f172a", borderRadius: 8, padding: 10, border: "1px solid #1e293b" }}>
            <div style={{ fontSize: 16, fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, color: "#60a5fa" }}>{responseEff}%</div>
            <div style={{ fontSize: 9, color: "#6b7280" }}>Response Efficiency</div>
          </div>
          <div style={{ background: "#0f172a", borderRadius: 8, padding: 10, border: "1px solid #1e293b" }}>
            <div style={{ fontSize: 16, fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, color: "#a78bfa" }}>{coverage}%</div>
            <div style={{ fontSize: 9, color: "#6b7280" }}>Zone Coverage</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AIThinkingPanel = ({ isRunning, currentStep }) => {
  const steps = [
    { label: "Aggregating multisource telemetry", duration: 800 },
    { label: "Running heuristic severity evaluation", duration: 1200 },
    { label: "Optimizing routing & logistics paths", duration: 1500 },
    { label: "Synthesizing strategic Gemini field report", duration: 2000 },
    { label: "Finalizing resource dispatch protocols", duration: 800 }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {steps.map((step, idx) => {
        const isPast = currentStep > idx;
        const isCurrent = currentStep === idx;
        const isPending = currentStep < idx;

        let icon = <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid #374151" }} />;
        let color = "#4b5563";

        if (isPast) {
          icon = <CheckCircle size={14} style={{ color: "#22c55e" }} />;
          color = "#9ca3af";
        } else if (isCurrent) {
          icon = <svg width="14" height="14" viewBox="0 0 14 14" className="spin"><circle cx="7" cy="7" r="5" stroke="#3b82f6" strokeWidth="2" fill="none" strokeDasharray="15 10" /></svg>;
          color = "#60a5fa";
        }

        return (
          <div key={idx} className="flex items-center gap-3" style={{ opacity: isPending && !isRunning ? 0.3 : 1, transition: "all 0.3s ease" }}>
            {icon}
            <span style={{ fontSize: 12, color, fontFamily: "'Rajdhani',sans-serif", fontWeight: isCurrent ? 600 : 500 }}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};
