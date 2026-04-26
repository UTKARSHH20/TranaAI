import { useState } from "react";
import { Activity, Users, TrendingUp, AlertTriangle, Play } from "lucide-react";
import { PageHeader } from "../components/SharedComponents";
import { sevColor } from "../utils/helpers";
import { useStore } from "../store";

const Simulate = () => {
  const { zones, personnel, simulationActive, toggleSimulation, updateZoneSeverity } = useStore();
  const [params, setParams] = useState({ sevEsc: 2, volDrop: 20 });
  const [results, setResults] = useState(null);
  const [running, setRunning] = useState(false);

  const run = async () => {
    setRunning(true); setResults(null);
    await new Promise(r => setTimeout(r, 1100));
    const simZones = zones.map(z => ({ ...z, severity: Math.min(10, z.severity + params.sevEsc) }));
    const simPers = personnel.filter((_, i) => i < Math.floor(personnel.length * (1 - params.volDrop / 100)));
    const critical = simZones.filter(z => z.severity >= 8);
    const available = simPers.filter(p => p.status === "Available");
    const coverage = ((available.length / simZones.length) * 100).toFixed(0);
    const top = simZones.sort((a, b) => b.severity - a.severity).slice(0, 5);
    
    // Actually apply the escalation to the global state if simulation is active
    if (simulationActive) {
      simZones.forEach(z => updateZoneSeverity(z.id, z.severity));
    }

    setResults({ critical: critical.length, available: available.length, coverage, top, zonesTotal: simZones.length });
    setRunning(false);
  };

  return (
    <div className="fade-up" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 900 }}>
      <div className="card-lift" style={{ background: "#0d1117", border: "1px solid #1f2937", borderRadius: 16, padding: 28 }}>
        <div className="flex items-center justify-between mb-4">
          <PageHeader icon={Activity} iconBg="#2d1b69" title="What-If Simulation" subtitle="Stress-test the AI allocation model under hypothetical extreme conditions." />
          <button 
            onClick={toggleSimulation}
            style={{ 
              background: simulationActive ? "rgba(139, 92, 246, 0.2)" : "transparent",
              border: `1px solid ${simulationActive ? "#8b5cf6" : "#374151"}`,
              color: simulationActive ? "#c4b5fd" : "#9ca3af",
              padding: "6px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer",
              transition: "all 0.3s ease"
            }}
          >
            {simulationActive ? "Simulation ACTIVE (Global)" : "Enable Global Simulation"}
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {[
            { key: "sevEsc", label: "Severity Escalation", sub: "Increases severity across all active zones to simulate worsening conditions.", min: 0, max: 5, unit: "pts", color: "#ef4444" },
            { key: "volDrop", label: "Volunteer Unavailability", sub: "Simulates road closures/fatigue preventing a percentage of personnel from deploying.", min: 0, max: 80, unit: "% drop", color: "#f97316" },
          ].map(({ key, label, sub, min, max, color }) => (
            <div key={key} style={{ background: "#060a13", border: "1px solid #1f2937", borderRadius: 12, padding: 18 }}>
              <div className="flex items-center gap-2 mb-2">
                {key === "sevEsc" ? <TrendingUp size={14} style={{ color: "#ef4444" }} /> : <Users size={14} style={{ color: "#f97316" }} />}
                <span style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 600, fontSize: 14, color: "#e2e8f0" }}>{label}</span>
                <span style={{ marginLeft: "auto", fontSize: 11, background: key === "sevEsc" ? "rgba(239,68,68,.15)" : "rgba(249,115,22,.15)", color, padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>
                  {key === "sevEsc" ? `+${params[key]} pts` : `${params[key]}% drop`}
                </span>
              </div>
              <input type="range" min={min} max={max} step={1} value={params[key]} onChange={e => setParams({ ...params, [key]: +e.target.value })} style={{ width: "100%", marginBottom: 8, accentColor: color }} />
              <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.6 }}>{sub}</p>
            </div>
          ))}
          <button onClick={run} disabled={running}
            className="flex items-center justify-center gap-2 w-full micro-press"
            style={{
              padding: "14px", borderRadius: 12,
              background: running ? "#4b1d96" : "linear-gradient(135deg,#7c3aed,#6d28d9)",
              color: "#fff", border: "none", cursor: running ? "not-allowed" : "pointer",
              fontFamily: "'Rajdhani',sans-serif", fontSize: 15, fontWeight: 700, letterSpacing: "0.06em"
            }}>
            {running
              ? <svg width="16" height="16" viewBox="0 0 16 16" className="spin"><circle cx="8" cy="8" r="6" stroke="#c4b5fd" strokeWidth="1.5" fill="none" strokeDasharray="25 13" /></svg>
              : <Play size={14} />}
            {running ? "Simulating…" : (simulationActive ? "Apply to Global State" : "Run Isolated Simulation")}
          </button>
        </div>
      </div>

      <div className="card-lift" style={{ background: "#0d1117", border: "1px solid #1f2937", borderRadius: 16, padding: 28 }}>
        <h2 className="rj" style={{ fontWeight: 700, fontSize: 17, color: "#f0f4fa", marginBottom: 20 }}>Simulation Results</h2>
        {!results ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 320, color: "#374151" }}>
            <Activity size={36} style={{ marginBottom: 12, opacity: 0.3 }} />
            <p style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 600, fontSize: 15, color: "#4b5563", marginBottom: 6 }}>Ready for Simulation</p>
            <p style={{ fontSize: 12, color: "#374151", textAlign: "center", maxWidth: 220 }}>Adjust the parameters on the left and run the simulation.</p>
          </div>
        ) : (
          <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { l: "Critical Zones", v: results.critical, c: "#ef4444" },
                { l: "Available Personnel", v: results.available, c: "#f97316" },
                { l: "Coverage Rate", v: results.coverage + "%", c: "#eab308" },
                { l: "Zones Monitored", v: results.zonesTotal, c: "#3b82f6" },
              ].map(({ l, v, c }) => (
                <div key={l} style={{ background: "#060a13", border: `1px solid ${c}22`, borderRadius: 10, padding: "12px 14px" }}>
                  <div style={{ fontSize: 22, fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, color: c }}>{v}</div>
                  <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{ background: "#060a13", border: "1px solid #1f2937", borderRadius: 10, padding: 16 }}>
              <p style={{ fontSize: 10, color: "#4b5563", fontFamily: "'Rajdhani',sans-serif", fontWeight: 600, letterSpacing: "0.08em", marginBottom: 10 }}>TOP ZONES (POST-SIMULATION)</p>
              {results.top.map((z, i) => (
                <div key={z.id} className="flex items-center gap-2 mb-2">
                  <span style={{ fontSize: 10, color: "#374151", fontFamily: "'Rajdhani',sans-serif", fontWeight: 600, minWidth: 14 }}>#{i + 1}</span>
                  <div style={{ flex: 1, height: 6, borderRadius: 3, background: "#111827", overflow: "hidden" }}>
                    <div style={{ height: "100%", background: sevColor(z.severity), width: `${(z.severity / 10) * 100}%`, borderRadius: 3, transition: "width 0.5s ease" }} />
                  </div>
                  <span style={{ fontSize: 11, color: "#9ca3af", minWidth: 80 }}>{z.name}</span>
                  <span style={{ fontSize: 11, color: sevColor(z.severity), fontWeight: 600, minWidth: 28 }}>{z.severity.toFixed(1)}</span>
                </div>
              ))}
            </div>
            <div style={{ background: "rgba(239,68,68,.07)", border: "1px solid rgba(239,68,68,.2)", borderRadius: 10, padding: 14 }}>
              <div className="flex items-center gap-2" style={{ alignItems: "flex-start" }}>
                <AlertTriangle size={13} style={{ color: "#f87171", flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 11, color: "#fca5a5", lineHeight: 1.6 }}>
                  Under these conditions, {results.critical} zones escalate to Critical with only {results.available} personnel available — significant strain on response capacity.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Simulate;
