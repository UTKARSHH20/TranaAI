import { useState, useRef } from "react";
import * as d3 from "d3";
import { INDIA_GEO } from "../data/zones";
import { sevColor, sevLabel, fmtPop } from "../utils/helpers";
import { TrendingUp, TrendingDown } from "lucide-react";

const W = 520, H = 600;

const IndiaMap = ({ zones, onSelect, selected, crisisMode, highlightZones }) => {
  const [tip, setTip] = useState(null);
  const svgRef = useRef(null);
  const proj = d3.geoMercator().center([82, 23]).scale(870).translate([W / 2, H / 2]);
  const pathGen = d3.geoPath().projection(proj);
  const path = pathGen(INDIA_GEO);
  const dots = zones.map(z => { const [x, y] = proj([z.lng, z.lat]); return { ...z, x, y }; });
  const highlightIds = new Set((highlightZones || []).map(z => z.id));

  return (
    <div className="relative w-full h-full cinematic-map" style={{ background: "#060a13", borderRadius: 8, overflow: "hidden" }}>
      {/* Scanline effect */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 5, overflow: "hidden"
      }}>
        <div style={{
          position: "absolute", left: 0, right: 0, height: "2px",
          background: "linear-gradient(to right, transparent, rgba(59,130,246,0.08), transparent)",
          animation: "scanline 8s linear infinite"
        }} />
      </div>

      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100%", display: "block" }}>
        {/* Grid lines */}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <line key={"h" + i} x1={0} x2={W} y1={i * H / 8} y2={i * H / 8} stroke="#0a1220" strokeWidth={1} />
        ))}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <line key={"v" + i} x1={i * W / 8} x2={i * W / 8} y1={0} y2={H} stroke="#0a1220" strokeWidth={1} />
        ))}

        {/* India outline */}
        <path d={path} fill={crisisMode ? "#120a1a" : "#0a1728"} stroke={crisisMode ? "#3d1520" : "#1d3557"} strokeWidth={1.5}
          style={{ transition: "fill 0.8s ease, stroke 0.8s ease" }} />

        {/* Zone dots */}
        {dots.map(z => {
          const isHighlighted = highlightIds.has(z.id);
          const isCritical = z.severity >= 8.5;
          return (
            <g key={z.id} onClick={() => onSelect(selected?.id === z.id ? null : z)} style={{ cursor: "pointer" }}
              onMouseEnter={e => { setTip({ z, x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY }); }}
              onMouseLeave={() => setTip(null)}>

              {/* Ripple for highlighted zones (post AI) */}
              {isHighlighted && (
                <>
                  <circle cx={z.x} cy={z.y} r={20} fill="none" stroke={sevColor(z.severity)} strokeWidth={1}
                    opacity={0.3} style={{ animation: "ripple 2s ease-out infinite" }} />
                  <circle cx={z.x} cy={z.y} r={20} fill="none" stroke={sevColor(z.severity)} strokeWidth={1}
                    opacity={0.3} style={{ animation: "ripple 2s ease-out infinite 0.7s" }} />
                </>
              )}

              {/* Selection ring */}
              {selected?.id === z.id && (
                <circle cx={z.x} cy={z.y} r={16} fill={sevColor(z.severity)} fillOpacity={0.12}
                  stroke={sevColor(z.severity)} strokeWidth={1} strokeOpacity={0.4} />
              )}

              {/* Main dot */}
              <circle cx={z.x} cy={z.y} r={z.severity >= 8 ? 8 : z.severity >= 6 ? 7 : 6}
                fill={sevColor(z.severity)} opacity={0.88}
                style={{
                  filter: `drop-shadow(0 0 ${z.severity >= 8 ? 7 : 4}px ${sevColor(z.severity)}88)`,
                  animation: isCritical && crisisMode ? "breathe 1.5s ease-in-out infinite" : z.severity >= 8 ? "breathe 3s ease-in-out infinite" : "none",
                }} />

              {/* Pulse ring for critical */}
              {z.severity >= 8 && (
                <circle cx={z.x} cy={z.y} r={11} fill="none" stroke={sevColor(z.severity)}
                  strokeWidth={crisisMode ? 1.8 : 1.2} opacity={0.4} className="pulse" />
              )}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="absolute rounded-lg" style={{ bottom: 12, left: 12, padding: 10, background: "rgba(6,10,19,.92)", border: "1px solid #1f2937" }}>
        <p style={{ color: "#4b5563", fontSize: 9, letterSpacing: "0.1em", fontFamily: "'Rajdhani',sans-serif", fontWeight: 600, marginBottom: 6 }}>SEVERITY</p>
        {[["Critical", "#ef4444"], ["High", "#f97316"], ["Medium", "#eab308"], ["Low", "#22c55e"]].map(([lb, cl]) => (
          <div key={lb} className="flex items-center gap-1 mb-1" style={{ gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: cl, boxShadow: `0 0 5px ${cl}` }} />
            <span style={{ fontSize: 10, color: "#9ca3af" }}>{lb}</span>
          </div>
        ))}
      </div>

      {/* Coordinates display */}
      <div className="absolute" style={{ top: 12, right: 12, fontSize: 9, color: "#374151", fontFamily: "'Rajdhani',sans-serif", fontWeight: 600, letterSpacing: "0.08em" }}>
        {zones.length} ZONES · INDIA THEATRE
      </div>

      {/* Tooltip */}
      {tip && (
        <div className="absolute pointer-events-none rounded-lg px-3 py-2 text-xs shadow-xl"
          style={{ background: "#0d1117", border: "1px solid #374151", color: "#f9fafb", left: tip.x + 14, top: Math.max(4, tip.y - 40), zIndex: 10 }}>
          <div style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 600, fontSize: 13 }}>{tip.z.name}</div>
          <div style={{ color: sevColor(tip.z.severity) }}>{tip.z.type} · {sevLabel(tip.z.severity)}</div>
          <div style={{ color: "#9ca3af" }}>Pop: {fmtPop(tip.z.pop)} · Sev: {tip.z.severity}/10</div>
          <div style={{ color: tip.z.trend > 0 ? "#f97316" : "#22c55e", marginTop: 2, fontSize: 10 }}>
            {tip.z.trend > 0 ? <TrendingUp size={9} style={{ display: "inline", marginRight: 2 }} /> : <TrendingDown size={9} style={{ display: "inline", marginRight: 2 }} />}
            Trend: {tip.z.trend > 0 ? "+" : ""}{tip.z.trend}
          </div>
        </div>
      )}
    </div>
  );
};

export default IndiaMap;
