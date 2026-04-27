import { useState, useEffect, useRef } from "react";
import { Activity, ChevronRight, Users, AlertTriangle, Brain } from "lucide-react";
import { easeOutQuart } from "../utils/helpers";

const Landing = ({ onLaunch }) => {
  const [entered, setEntered] = useState(false);
  const [counts, setCounts] = useState({ zones: 0, vols: 0, alerts: 0 });
  const animated = useRef(false);

  useEffect(() => {
    setEntered(true);
    if (animated.current) return;
    animated.current = true;
    const targets = { zones: 30, vols: 50, alerts: 4 };
    const dur = 2200;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / dur, 1);
      const e = easeOutQuart(t);
      setCounts({
        zones: Math.round(targets.zones * e),
        vols: Math.round(targets.vols * e),
        alerts: Math.round(targets.alerts * e),
      });
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, []);

  return (
    <div style={{
      minHeight: "100vh", background: "#07090f", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: "40px 20px",
      position: "relative", overflow: "hidden",
      opacity: entered ? 1 : 0, transition: "opacity 1s ease"
    }}>
      {/* Background effects */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 60% at 50% 40%,rgba(29,78,216,.06) 0%,transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "15%", left: "50%", transform: "translateX(-50%)", width: 1, height: "70%", background: "linear-gradient(to bottom,transparent,rgba(59,130,246,.06),transparent)", pointerEvents: "none" }} />

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          width: 2 + Math.random() * 3,
          height: 2 + Math.random() * 3,
          borderRadius: "50%",
          background: `rgba(59,130,246,${0.1 + Math.random() * 0.15})`,
          top: `${10 + Math.random() * 80}%`,
          left: `${10 + Math.random() * 80}%`,
          animation: `breathe ${3 + Math.random() * 4}s ease-in-out infinite ${Math.random() * 2}s`,
          pointerEvents: "none"
        }} />
      ))}

      <div className="flex items-center gap-3 mb-8 fade-up">
        <div style={{ width: 42, height: 42, background: "rgba(29,78,216,.2)", border: "1px solid #1d4ed8", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Activity size={20} style={{ color: "#60a5fa" }} />
        </div>
        <span className="rj" style={{ fontWeight: 700, fontSize: 22, color: "#f0f4fa", letterSpacing: ".02em" }}>
          Trana<span style={{ color: "#3b82f6" }}>AI</span>
        </span>
      </div>

      <div className="fade-up" style={{
        background: "rgba(34,197,94,.1)", border: "1px solid rgba(34,197,94,.2)",
        color: "#4ade80", fontSize: 11, padding: "5px 14px", borderRadius: 20, marginBottom: 32,
        display: "flex", alignItems: "center", gap: 6, animationDelay: ".1s"
      }}>
        <span className="live-dot" />
        System Online · Gemini Integration Active
      </div>

      <h1 className="rj fade-up" style={{
        fontWeight: 700, fontSize: 64, color: "#f0f4fa", textAlign: "center",
        lineHeight: 1.05, maxWidth: 700, marginBottom: 20, animationDelay: ".15s"
      }}>
        AI-Powered<br />Disaster Response
      </h1>

      <p className="fade-up" style={{
        fontSize: 16, color: "#6b7280", textAlign: "center", maxWidth: 520,
        lineHeight: 1.7, marginBottom: 40, animationDelay: ".2s"
      }}>
        Real-time command center for emergency coordinators. Allocate volunteers instantly with predictive AI models and Gemini-powered field analysis.
      </p>

      <button onClick={onLaunch} className="fade-up flex items-center gap-2 micro-press" style={{
        background: "linear-gradient(135deg,#1d4ed8,#2563eb)", color: "#fff",
        border: "none", borderRadius: 50, padding: "14px 36px", fontSize: 16,
        fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, letterSpacing: ".06em",
        cursor: "pointer", animationDelay: ".25s",
        boxShadow: "0 0 40px rgba(37,99,235,.3)"
      }}>
        Launch Dashboard <ChevronRight size={17} />
      </button>

      {/* Stats with count-up animation */}
      <div className="fade-up" style={{
        display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16,
        marginTop: 64, maxWidth: 800, width: "100%", animationDelay: ".35s"
      }}>
        {[
          { icon: Activity, val: String(counts.zones), sub: "ZONES MONITORED", c: "#3b82f6" },
          { icon: Users, val: String(counts.vols), sub: "VOLUNTEERS", c: "#22c55e" },
          { icon: AlertTriangle, val: String(counts.alerts), sub: "CRITICAL ALERTS", c: "#ef4444" },
          { icon: Brain, val: "AI", sub: "GEMINI ANALYSIS", c: "#a855f7" },
        ].map(({ icon: Ic, val, sub, c }) => (
          <div key={sub} className="card-lift" style={{
            background: "#0d1117", border: "1px solid #1f2937",
            borderRadius: 16, padding: "24px 20px", textAlign: "center"
          }}>
            <Ic size={22} style={{ color: c, margin: "0 auto 12px", display: "block" }} />
            <div className="rj stat-value" style={{ fontWeight: 700, fontSize: 28, color: "#f0f4fa" }}>{val}</div>
            <div style={{ fontSize: 10, color: "#4b5563", letterSpacing: "0.1em", marginTop: 4, fontFamily: "'Rajdhani',sans-serif", fontWeight: 600 }}>{sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Landing;
