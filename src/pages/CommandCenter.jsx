import { useState, useEffect, useRef } from "react";
import { Activity, Users, MapPin, RefreshCw, AlertTriangle, TrendingUp, TrendingDown, Eye, Info, Clock, CheckCircle, PlayCircle, Radio, Wifi } from "lucide-react";
import GoogleIndiaMap from "../components/GoogleIndiaMap";
import ZoneDetailCard from "../components/ZoneDetailCard";
import { ImpactPanel } from "../components/WowFeatures";
import { sevColor, fmtPop, easeOutQuart } from "../utils/helpers";
import { useStore } from "../store";

const CommandCenter = () => {
  const { zones, personnel, crisisMode, runAIAllocation, aiAllocations, mapPolylines, simulationActive, updateZoneSeverity, triggerReplay, isReplaying } = useStore();
  const [selected, setSelected] = useState(null);
  const [running, setRunning] = useState(false);
  const [statCounts, setStatCounts] = useState({ zones: 0, vols: 0, deployed: 0 });
  const animated = useRef(false);

  const critical = zones.filter(z => z.severity >= 8);
  const available = personnel.filter(p => p.status === "Available");
  const deployedCount = personnel.filter(p => p.status === "Deployed").length;

  /* ─── CINEMATIC COUNT-UP ────────────────────────────────────────────────── */
  useEffect(() => {
    if (animated.current) return;
    animated.current = true;
    const targets = { zones: zones.length, vols: personnel.length, deployed: deployedCount };
    const dur = 1800;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / dur, 1);
      const e = easeOutQuart(t);
      setStatCounts({
        zones: Math.round(targets.zones * e),
        vols: Math.round(targets.vols * e),
        deployed: Math.round(targets.deployed * e),
      });
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, []);

  // Sync count if simulation changes it dramatically
  useEffect(() => {
    setStatCounts(prev => ({ ...prev, deployed: deployedCount }));
  }, [deployedCount]);

  const handleRunAlloc = async () => {
    setRunning(true);
    await new Promise(r => setTimeout(r, 900)); // Simulate thinking
    runAIAllocation();
    setRunning(false);
    // Auto focus the highest priority zone
    if (aiAllocations.length > 0 && !selected) {
      setSelected(aiAllocations[0].zone);
    }
  };

  return (
    <div className="fade-up cinematic-enter" style={{ display: "flex", flexDirection: "column", gap: 16, height: "100%" }}>
      {/* Stats bar */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 12 }}>
        {[
          { label: "Active Zones", val: statCounts.zones, sub: `${critical.length} Critical`, icon: Activity, color: "#3b82f6" },
          { label: "Total Volunteers", val: statCounts.vols, sub: `${available.length} Available`, icon: Users, color: "#22c55e" },
          { label: "Resources Deployed", val: statCounts.deployed, sub: `/ ${personnel.length}`, icon: MapPin, color: "#f97316" },
        ].map(({ label, val, sub, icon: Ic, color }) => (
          <div key={label} className="card-lift" style={{ background: "#0d1117", border: "1px solid #1f2937", borderRadius: 12, padding: "14px 18px" }}>
            <div className="flex items-center gap-2 mb-1">
              <Ic size={14} style={{ color }} />
              <span style={{ fontSize: 11, color: "#4b5563", letterSpacing: "0.08em", fontFamily: "'Rajdhani',sans-serif", fontWeight: 600 }}>{label.toUpperCase()}</span>
            </div>
            <div className="rj stat-value" style={{ fontSize: 32, fontWeight: 700, color: "#f0f4fa", lineHeight: 1 }}>{val}</div>
            <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{sub}</div>
          </div>
        ))}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, justifyContent: "center" }}>
          <button onClick={handleRunAlloc} disabled={running || isReplaying}
            className="flex items-center justify-center gap-2 px-5 rounded-xl font-semibold text-sm micro-press"
            style={{ background: "#1d4ed8", color: "#fff", fontSize: 13, border: "none", cursor: (running || isReplaying) ? "not-allowed" : "pointer", opacity: (running || isReplaying) ? 0.7 : 1, minWidth: 160, padding: "10px 20px", borderRadius: 12 }}>
            {running
              ? <svg width="15" height="15" viewBox="0 0 15 15" className="spin"><circle cx="7.5" cy="7.5" r="6" stroke="#93c5fd" strokeWidth="1.5" fill="none" strokeDasharray="25 13" /></svg>
              : <RefreshCw size={14} />}
            {running ? "Analyzing…" : "Run AI Allocation"}
          </button>
          
          <button onClick={triggerReplay} disabled={running || isReplaying}
            className="flex items-center justify-center gap-2 px-5 rounded-xl font-semibold text-sm micro-press"
            style={{ background: "#1e293b", color: "#cbd5e1", fontSize: 12, border: "1px solid #334155", cursor: (running || isReplaying) ? "not-allowed" : "pointer", opacity: (running || isReplaying) ? 0.7 : 1, padding: "6px 20px", borderRadius: 12 }}>
            {isReplaying ? <Activity size={12} className="spin" /> : <PlayCircle size={12} />}
            {isReplaying ? "Replaying Crisis..." : "Replay Crisis"}
          </button>
        </div>
      </div>

      {/* Main 3-col */}
      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr 300px", gap: 12, flex: 1, minHeight: 0 }}>
        {/* Left Col: Zones list + What-If */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, overflow: "hidden" }}>
          <div style={{ background: "#0d1117", border: "1px solid #1f2937", borderRadius: 12, display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
            <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid #111827", padding: "12px 16px" }}>
              <div className="flex items-center gap-2">
                <AlertTriangle size={12} style={{ color: "#f97316" }} />
                <span style={{ fontSize: 10, letterSpacing: "0.1em", color: "#6b7280", fontFamily: "'Rajdhani',sans-serif", fontWeight: 600 }}>TOP 10 CRITICAL ZONES</span>
              </div>
              {simulationActive && <span style={{ fontSize: 9, background: "#8b5cf6", color: "#fff", padding: "2px 6px", borderRadius: 4 }}>SIMULATION ON</span>}
            </div>
            <div style={{ overflowY: "auto", flex: 1 }}>
              {[...zones].sort((a, b) => (b.severity * b.population) - (a.severity * a.population)).slice(0, 10).map(z => (
                <div key={z.id} onClick={() => setSelected(selected?.id === z.id ? null : z)}
                  className="cursor-pointer transition-colors micro-hover"
                  style={{
                    borderLeft: `3px solid ${sevColor(z.severity)}`, borderBottom: "1px solid #0a0e1a",
                    background: selected?.id === z.id ? "rgba(59,130,246,.07)" : "transparent",
                    padding: "10px 16px"
                  }}>
                  <div className="flex items-center justify-between" style={{ marginBottom: 2 }}>
                    <span style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 600, fontSize: 13, color: "#e2e8f0" }}>
                      {z.name.length > 15 ? z.name.slice(0, 15) + "…" : z.name}
                    </span>
                    <span style={{ fontSize: 11, color: sevColor(z.severity), fontWeight: 600 }}>{z.severity.toFixed(1)}/10</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span style={{ fontSize: 10, color: "#6b7280" }}>{z.disaster_type}</span>
                    <span style={{ fontSize: 10, color: "#4b5563" }}>·</span>
                    <span style={{ fontSize: 10, color: "#4b5563" }}>{fmtPop(z.population)} pop</span>
                  </div>
                  
                  {/* Interactive What-If Slider */}
                  {simulationActive && (
                    <div onClick={e => e.stopPropagation()}>
                      <input type="range" min="1" max="10" step="0.5" value={z.severity} 
                        onChange={(e) => {
                          updateZoneSeverity(z.id, parseFloat(e.target.value));
                          runAIAllocation(); // Instantly react
                        }} 
                        style={{ width: "100%", accentColor: sevColor(z.severity) }} 
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Map with overlay */}
        <div style={{ background: "#0a0f18", border: "1px solid #1e293b", borderRadius: 12, overflow: "hidden", minHeight: 400, position: "relative" }}>
          <GoogleIndiaMap onSelect={setSelected} selected={selected} />
          
          {/* WOW FEATURE: Live Drone Telemetry Overlay */}
          {selected && (
            <div className="fade-in" style={{ position: "absolute", bottom: 16, left: 16, background: "rgba(2, 6, 23, 0.8)", backdropFilter: "blur(4px)", border: "1px solid #334155", borderRadius: 8, padding: 12, width: 220, pointerEvents: "none" }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Radio size={12} style={{ color: "#3b82f6" }} />
                  <span style={{ fontSize: 10, letterSpacing: "0.1em", color: "#94a3b8", fontFamily: "'Rajdhani',sans-serif", fontWeight: 700 }}>DRONE UPLINK</span>
                </div>
                <div className="flex items-center gap-1">
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", animation: "pulse 1s infinite" }} />
                  <span style={{ fontSize: 9, color: "#22c55e" }}>LIVE</span>
                </div>
              </div>
              <div style={{ height: 60, background: "#000", borderRadius: 4, overflow: "hidden", position: "relative", marginBottom: 8, border: "1px solid #1e293b" }}>
                {/* Synthetic terrain/scanline simulation */}
                <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)", backgroundSize: "10px 10px", opacity: 0.5 }} />
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "rgba(59, 130, 246, 0.8)", animation: "scanline 2s linear infinite" }} />
                <div style={{ position: "absolute", bottom: 4, left: 4, fontSize: 8, color: "#60a5fa", fontFamily: "monospace" }}>ALT: 450m | TGT: {selected.lat.toFixed(3)}</div>
              </div>
              <div className="flex justify-between items-center" style={{ fontSize: 9, color: "#64748b", fontFamily: "monospace" }}>
                <span className="flex items-center gap-1"><Wifi size={10} /> 12ms ping</span>
                <span>ENC: AES-256</span>
              </div>
            </div>
          )}
        </div>

        {/* Right panel: Details & AI Decisions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, overflowY: "auto" }}>
          
          {/* Active Zone Detail */}
          {selected ? (
            <div className="card-lift" style={{ background: "#0d1117", border: "1px solid #1f2937", borderRadius: 12, padding: 12 }}>
              <div className="flex items-center gap-2 mb-2">
                <Eye size={11} style={{ color: "#3b82f6" }} />
                <span style={{ fontSize: 10, letterSpacing: "0.1em", color: "#6b7280", fontFamily: "'Rajdhani',sans-serif", fontWeight: 600 }}>ZONE DETAIL</span>
              </div>
              <ZoneDetailCard zone={selected} onClose={() => setSelected(null)} />
            </div>
          ) : (
            <div style={{ background: "#0d1117", border: "1px solid #1f2937", borderRadius: 12, padding: 20, textAlign: "center", color: "#4b5563" }}>
              <MapPin size={24} style={{ margin: "0 auto 8px", opacity: 0.5 }} />
              <p style={{ fontSize: 12 }}>Select a zone on the map or list to view time-to-failure metrics.</p>
            </div>
          )}

          {/* AI Decision Reasoning Panel (New) */}
          <div style={{ background: "#0d1117", border: "1px solid #1f2937", borderRadius: 12, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div className="flex items-center gap-2" style={{ borderBottom: "1px solid #111827", padding: "12px 16px", background: "rgba(37, 99, 235, 0.05)" }}>
              <CheckCircle size={13} style={{ color: "#3b82f6" }} />
              <span style={{ fontSize: 10, letterSpacing: "0.1em", color: "#93c5fd", fontFamily: "'Rajdhani',sans-serif", fontWeight: 700 }}>AI COMMAND SUGGESTIONS</span>
            </div>
            <div style={{ padding: 12 }}>
              {aiAllocations.length === 0 ? (
                <p style={{ fontSize: 11, color: "#6b7280", textAlign: "center", margin: "10px 0" }}>Run AI Allocation to view live decision reasoning.</p>
              ) : (
                aiAllocations.slice(0, 3).map((alloc, i) => (
                  <div key={i} className="fade-up" style={{ background: "#060a13", border: "1px solid #1f2937", borderRadius: 8, padding: 10, marginBottom: 8, animationDelay: `${i * 0.1}s` }}>
                    <div className="flex justify-between items-center mb-1">
                      <span style={{ fontSize: 12, color: sevColor(alloc.zone.severity), fontWeight: 600 }}>{alloc.zone.name}</span>
                      <span style={{ fontSize: 9, background: alloc.zone.severity >= 8 ? "#7f1d1d" : "#1e3a8a", color: "#fff", padding: "2px 6px", borderRadius: 4 }}>
                        {alloc.zone.severity >= 8 ? "HIGH URGENCY" : "MED URGENCY"}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: "#d1d5db", marginBottom: 6 }}>
                      Action: Deploy {alloc.personnel.length} units
                    </div>
                    <div className="flex gap-2 items-start" style={{ background: "#111827", padding: 8, borderRadius: 6 }}>
                      <Info size={12} style={{ color: "#9ca3af", marginTop: 2, flexShrink: 0 }} />
                      <p style={{ fontSize: 10, color: "#9ca3af", lineHeight: 1.4 }}>
                        Score: {alloc.score}. Reason: Critical severity ({alloc.zone.severity}) with high population density and resource deficit.
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <ImpactPanel />
        </div>
      </div>
    </div>
  );
};

export default CommandCenter;
