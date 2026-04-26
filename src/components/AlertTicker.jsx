import { useState, useEffect } from "react";
import { AlertTriangle, Info, Zap } from "lucide-react";
import { useStore } from "../store";

const ALERTS = [
  { type: "info", text: "Gemini 2.0 Flash connected" },
  { type: "warn", text: "High winds reported in Eastern sector" },
  { type: "critical", text: "Comms tower offline in Zone 4" },
  { type: "info", text: "Supply drop ETA 14:00 IST" }
];

const AlertTicker = () => {
  const { crisisMode, zones, personnel } = useStore();
  const [alerts, setAlerts] = useState(ALERTS);

  useEffect(() => {
    // Req 8: Smart Alert Engine (Auto-generate alerts based on state)
    const interval = setInterval(() => {
      const newAlerts = [...alerts];
      
      const criticalZones = zones.filter(z => z.severity >= 8.5);
      if (criticalZones.length > 0) {
        const randomCrit = criticalZones[Math.floor(Math.random() * criticalZones.length)];
        newAlerts.unshift({ type: "critical", text: `⚠ ${randomCrit.disaster_type} severity critical in ${randomCrit.name}` });
      }

      const availableVols = personnel.filter(p => p.status === "Available").length;
      if (availableVols < 5) {
        newAlerts.unshift({ type: "warn", text: `Low resources: Only ${availableVols} personnel available` });
      }

      if (newAlerts.length > 10) newAlerts.pop();
      setAlerts(newAlerts);
    }, 12000); // Check every 12 seconds
    return () => clearInterval(interval);
  }, [zones, personnel, alerts]);

  return (
    <div style={{
      background: crisisMode ? "#450a0a" : "#0f172a",
      borderBottom: `1px solid ${crisisMode ? "#7f1d1d" : "#1e293b"}`,
      padding: "8px 16px", display: "flex", alignItems: "center", gap: 12,
      overflow: "hidden", position: "relative", zIndex: 50,
      transition: "background 0.5s ease, border-color 0.5s ease"
    }}>
      <div className="flex items-center gap-2" style={{
        background: crisisMode ? "#7f1d1d" : "#1e293b",
        padding: "4px 10px", borderRadius: 6, zIndex: 2, flexShrink: 0
      }}>
        {crisisMode ? <AlertTriangle size={14} className="pulse" style={{ color: "#fca5a5" }} /> : <Zap size={14} style={{ color: "#60a5fa" }} />}
        <span style={{ fontSize: 11, fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, letterSpacing: "0.1em", color: crisisMode ? "#fca5a5" : "#94a3b8" }}>
          LIVE FEED
        </span>
      </div>

      <div style={{ flex: 1, overflow: "hidden", position: "relative", height: 20 }}>
        <div className={`ticker-content ${crisisMode ? "ticker-fast" : ""}`} style={{ display: "flex", gap: 32, position: "absolute", whiteSpace: "nowrap" }}>
          {[...alerts, ...alerts, ...alerts].map((a, i) => (
            <div key={i} className="flex items-center gap-2" style={{ display: "inline-flex" }}>
              {a.type === "critical" && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444" }} className="pulse" />}
              {a.type === "warn" && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f97316" }} />}
              {a.type === "info" && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3b82f6" }} />}
              <span style={{
                fontSize: 12,
                color: a.type === "critical" ? "#fca5a5" : a.type === "warn" ? "#fdba74" : "#94a3b8",
                fontWeight: a.type === "critical" ? 600 : 400
              }}>
                {a.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AlertTicker;
