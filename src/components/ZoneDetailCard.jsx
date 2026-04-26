import { Activity, AlertTriangle, Users, Package, Clock } from "lucide-react";
import { sevColor, fmtPop } from "../utils/helpers";

const ZoneDetailCard = ({ zone, onClose }) => {
  if (!zone) return null;

  // Req 3: Time-to-Failure Engine
  // time_to_failure = resources / (severity_growth_rate + 1)
  const growthRate = zone.severity_growth_rate || (zone.trend > 0 ? zone.trend : 0);
  const ttfHours = (zone.resources / (growthRate + 1)).toFixed(1);
  
  let ttfColor = "#22c55e"; // Green
  let ttfText = "Stable";
  if (ttfHours < 2) {
    ttfColor = "#ef4444"; // Red
    ttfText = "CRITICAL FAILURE IMMINENT";
  } else if (ttfHours < 5) {
    ttfColor = "#f97316"; // Orange
    ttfText = "High Risk";
  }

  return (
    <div className="fade-up relative">
      {onClose && (
        <button onClick={onClose} style={{ position: "absolute", top: -4, right: -4, background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: 16 }}>×</button>
      )}
      
      <div className="flex items-center gap-3 mb-4">
        <div style={{ width: 40, height: 40, borderRadius: 10, background: `rgba(${zone.severity >= 8 ? "239,68,68" : "59,130,246"},.15)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <AlertTriangle size={20} style={{ color: sevColor(zone.severity) }} />
        </div>
        <div>
          <h3 style={{ margin: 0, fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 16, color: "#f0f4fa", lineHeight: 1.1 }}>{zone.name}</h3>
          <span style={{ fontSize: 11, color: "#9ca3af" }}>{zone.disaster_type} Incident</span>
        </div>
      </div>

      {/* Time-to-Failure Indicator */}
      <div style={{ background: "#060a13", border: `1px solid ${ttfColor}40`, borderRadius: 8, padding: 12, marginBottom: 16 }}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1">
            <Clock size={12} style={{ color: ttfColor }} />
            <span style={{ fontSize: 10, fontFamily: "'Rajdhani',sans-serif", fontWeight: 600, color: "#9ca3af", letterSpacing: "0.05em" }}>EST. TIME TO FAILURE</span>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: ttfColor }}>{ttfHours} hrs</span>
        </div>
        <div style={{ width: "100%", height: 4, background: "#111827", borderRadius: 2, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${Math.max(10, Math.min(100, (10 - ttfHours) * 10))}%`, background: ttfColor, transition: "width 1s ease" }} />
        </div>
        <p style={{ fontSize: 10, color: ttfColor, marginTop: 4, margin: 0 }}>{ttfText}</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ background: "#111827", borderRadius: 8, padding: 10 }}>
          <div className="flex items-center gap-2 mb-1" style={{ color: "#9ca3af" }}>
            <Activity size={12} /> <span style={{ fontSize: 10 }}>Severity</span>
          </div>
          <div style={{ fontSize: 18, fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, color: sevColor(zone.severity) }}>
            {zone.severity.toFixed(1)} <span style={{ fontSize: 11, color: "#6b7280" }}>/10</span>
          </div>
        </div>
        <div style={{ background: "#111827", borderRadius: 8, padding: 10 }}>
          <div className="flex items-center gap-2 mb-1" style={{ color: "#9ca3af" }}>
            <Users size={12} /> <span style={{ fontSize: 10 }}>Population</span>
          </div>
          <div style={{ fontSize: 14, fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, color: "#e2e8f0" }}>
            {fmtPop(zone.population)}
          </div>
        </div>
        <div style={{ background: "#111827", borderRadius: 8, padding: 10, gridColumn: "span 2" }}>
          <div className="flex items-center gap-2 mb-1" style={{ color: "#9ca3af" }}>
            <Package size={12} /> <span style={{ fontSize: 10 }}>Resources Available</span>
          </div>
          <div style={{ fontSize: 14, fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, color: "#e2e8f0" }}>
            {zone.resources} Units
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZoneDetailCard;
