import { useState, useEffect, useRef, useCallback } from "react";
import { Zap, Brain, Key, Send } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, Tooltip as RTooltip } from "recharts";
import { PageHeader } from "../components/SharedComponents";
import { AIThinkingPanel } from "../components/WowFeatures";
import { computeP, sevColor } from "../utils/helpers";
import { callGemini, buildPrompt, formatGeminiOutput } from "../utils/gemini";
import { useStore } from "../store";

const AIPriority = () => {
  const { zones, weights, updateWeight } = useStore();
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [geminiResponse, setGeminiResponse] = useState(null);
  const [geminiLoading, setGeminiLoading] = useState(false);
  const [geminiError, setGeminiError] = useState(null);
  const [question, setQuestion] = useState("");
  const [activeTab, setActiveTab] = useState("analysis");
  const [thinkingStep, setThinkingStep] = useState(-1);
  const [displayedText, setDisplayedText] = useState("");
  const fullTextRef = useRef("");
  const typewriterRef = useRef(null);

  const scored = [...zones].map(z => ({ ...z, score: computeP(z, weights) })).sort((a, b) => b.score - a.score);
  const chartData = scored.slice(0, 18).map(z => ({
    name: z.name.length > 12 ? z.name.slice(0, 12) + "…" : z.name,
    score: +z.score.toFixed(1),
    fill: sevColor(z.severity)
  }));

  /* ─── TYPEWRITER EFFECT ─────────────────────────────────────────────────── */
  const startTypewriter = useCallback((text) => {
    fullTextRef.current = text;
    setDisplayedText("");
    let idx = 0;
    const formatted = formatGeminiOutput(text);
    if (typewriterRef.current) clearInterval(typewriterRef.current);
    typewriterRef.current = setInterval(() => {
      idx += 3; // 3 chars at a time for speed
      if (idx >= formatted.length) {
        setDisplayedText(formatted);
        clearInterval(typewriterRef.current);
        typewriterRef.current = null;
      } else {
        setDisplayedText(formatted.slice(0, idx));
      }
    }, 12);
  }, []);

  useEffect(() => {
    return () => { if (typewriterRef.current) clearInterval(typewriterRef.current); };
  }, []);

  /* ─── AI THINKING SIMULATION ────────────────────────────────────────────── */
  const runThinkingSteps = () => {
    return new Promise((resolve) => {
      const steps = [0, 1, 2, 3, 4];
      let i = 0;
      setThinkingStep(0);
      const interval = setInterval(() => {
        i++;
        if (i >= steps.length) {
          clearInterval(interval);
          setTimeout(() => {
            setThinkingStep(5); // all done
            resolve();
          }, 400);
        } else {
          setThinkingStep(i);
        }
      }, 700);
    });
  };

  const handleGeminiAnalysis = async () => {
    if (!apiKey.trim()) { setGeminiError("Please enter your Gemini API key first."); return; }
    setGeminiLoading(true); setGeminiError(null); setGeminiResponse(null); setDisplayedText("");
    setThinkingStep(0);

    try {
      // Run thinking visualization in parallel with actual API call
      const [_, response] = await Promise.all([
        runThinkingSteps(),
        (async () => {
          const prompt = buildPrompt(zones, weights, activeTab === "ask" ? question : null);
          return await callGemini(apiKey, prompt);
        })()
      ]);

      setGeminiResponse(response);
      // Start typewriter after thinking completes
      setTimeout(() => startTypewriter(response), 200);
    } catch (e) {
      setGeminiError(e.message || "Failed to connect to Gemini. Check your API key.");
      setThinkingStep(-1);
    } finally {
      setGeminiLoading(false);
    }
  };

  const wList = [
    { key: "sev", label: "Base Severity", desc: "Current ground conditions", sub: "w₁" },
    { key: "pop", label: "Population Affected", desc: "Human impact scale", sub: "w₂" },
    { key: "res", label: "Resource Gap", desc: "Deficit of supplies/personnel", sub: "w₃" },
    { key: "trend", label: "Severity Trend", desc: "Rate of worsening conditions", sub: "w₄" },
  ];

  return (
    <div className="fade-up" style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 16 }}>
      {/* Left panel */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div className="card-lift" style={{ background: "#0d1117", border: "1px solid #1f2937", borderRadius: 16, padding: 24 }}>
          <PageHeader icon={Zap} iconBg="#78350f" title="Priority Engine" subtitle="Tune the mathematical weights powering AI allocation." />
          <div style={{ background: "#060a13", border: "1px solid #1f2937", borderRadius: 12, padding: 16, marginBottom: 20 }}>
            <div className="flex items-center gap-2 mb-2">
              <span style={{ fontSize: 16, fontFamily: "'Rajdhani',sans-serif", color: "#f97316" }}>∑</span>
              <span style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 14, color: "#fbbf24" }}>Formula</span>
            </div>
            <p style={{ fontFamily: "'Courier New',monospace", fontSize: 11, color: "#9ca3af", lineHeight: 1.8 }}>
              P = (w₁×S) + (w₂×Pop) + (w₃×Gap) + (w₄×T)
            </p>
          </div>
          {wList.map(({ key, label, desc, sub }) => (
            <div key={key} style={{ marginBottom: 18 }}>
              <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
                <span style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 600, fontSize: 14, color: "#e2e8f0" }}>
                  {label} <span style={{ fontSize: 11, color: "#4b5563" }}>({sub})</span>
                </span>
                <span style={{ background: "#111827", border: "1px solid #374151", color: "#f0f4fa", fontSize: 13, fontFamily: "'Rajdhani',sans-serif", fontWeight: 600, padding: "2px 10px", borderRadius: 6 }}>
                  {weights[key].toFixed(2)}
                </span>
              </div>
              <input type="range" min={0} max={1} step={0.05} value={weights[key]}
                onChange={e => updateWeight(key, parseFloat(e.target.value))} style={{ width: "100%", marginBottom: 4 }} />
              <p style={{ fontSize: 11, color: "#4b5563" }}>{desc}</p>
            </div>
          ))}
        </div>

        {/* Gemini API Panel */}
        <div className="card-lift" style={{ background: "#0d1117", border: "1px solid #1a2a4a", borderRadius: 16, padding: 20 }}>
          <div className="flex items-center gap-2 mb-4">
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#1a5276,#0d3b6e)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Brain size={15} style={{ color: "#60a5fa" }} />
            </div>
            <div>
              <div className="rj" style={{ fontWeight: 700, fontSize: 14, color: "#f0f4fa" }}>Gemini AI Analysis</div>
              <div style={{ fontSize: 11, color: "#4b5563" }}>Real AI · gemini-2.0-flash</div>
            </div>
          </div>

          {/* API Key */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, color: "#9ca3af", marginBottom: 5, display: "flex", alignItems: "center", gap: 5 }}>
              <Key size={10} /> Gemini API Key
            </label>
            <div className="flex gap-2">
              <input
                type={showKey ? "text" : "password"}
                placeholder="AIza…"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                style={{ flex: 1, background: "#060a13", border: "1px solid #1f2937", borderRadius: 8, padding: "7px 10px", fontSize: 12, color: "#f0f4fa", outline: "none", fontFamily: "monospace" }}
              />
              <button onClick={() => setShowKey(!showKey)}
                className="micro-press"
                style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 8, padding: "7px 10px", cursor: "pointer", color: "#4b5563", fontSize: 11 }}>
                {showKey ? "Hide" : "Show"}
              </button>
            </div>
            <p style={{ fontSize: 10, color: "#374151", marginTop: 4 }}>Get free key at aistudio.google.com. Key stays in your browser only.</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-3" style={{ background: "#060a13", borderRadius: 8, padding: 3 }}>
            {[["analysis", "Auto Analysis"], ["ask", "Ask Gemini"]].map(([tab, label]) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className="micro-press"
                style={{
                  flex: 1, padding: "5px 0", borderRadius: 6, border: "none", cursor: "pointer",
                  fontSize: 11, fontFamily: "'Rajdhani',sans-serif", fontWeight: 600,
                  background: activeTab === tab ? "#1d4ed8" : "transparent",
                  color: activeTab === tab ? "#fff" : "#4b5563"
                }}>
                {label}
              </button>
            ))}
          </div>

          {activeTab === "ask" && (
            <div style={{ marginBottom: 10 }}>
              <input
                placeholder="e.g. Which zone needs medical teams urgently?"
                value={question}
                onChange={e => setQuestion(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleGeminiAnalysis()}
                style={{ width: "100%", background: "#060a13", border: "1px solid #1f2937", borderRadius: 8, padding: "8px 10px", fontSize: 12, color: "#f0f4fa", outline: "none" }}
              />
            </div>
          )}

          <button
            onClick={handleGeminiAnalysis}
            disabled={geminiLoading || !apiKey.trim()}
            className="micro-press"
            style={{
              width: "100%", padding: "9px", borderRadius: 10,
              background: apiKey.trim() ? "linear-gradient(135deg,#1e40af,#2563eb)" : "#111827",
              color: apiKey.trim() ? "#fff" : "#4b5563", border: "none",
              cursor: apiKey.trim() && !geminiLoading ? "pointer" : "not-allowed",
              fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 13,
              letterSpacing: "0.05em", display: "flex", alignItems: "center", justifyContent: "center", gap: 6
            }}
          >
            {geminiLoading
              ? <><svg width="13" height="13" viewBox="0 0 13 13" className="spin"><circle cx="6.5" cy="6.5" r="5" stroke="#93c5fd" strokeWidth="1.5" fill="none" strokeDasharray="20 10" /></svg> Analyzing…</>
              : <><Send size={12} />{activeTab === "ask" ? "Ask Gemini" : "Run AI Analysis"}</>
            }
          </button>

          {geminiError && (
            <div style={{ marginTop: 10, background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.2)", borderRadius: 8, padding: 10 }}>
              <p style={{ fontSize: 11, color: "#fca5a5" }}>{geminiError}</p>
            </div>
          )}
        </div>
      </div>

      {/* Right panel */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {/* AI Thinking Visualization */}
        {(geminiLoading || thinkingStep >= 0) && (
          <div className="fade-up" style={{ background: "#0d1117", border: "1px solid #1a2a4a", borderRadius: 16, padding: 20 }}>
            <div className="flex items-center gap-2 mb-3">
              <Brain size={14} style={{ color: "#60a5fa" }} className={geminiLoading ? "pulse" : ""} />
              <span className="rj" style={{ fontWeight: 700, fontSize: 14, color: "#f0f4fa" }}>
                {geminiLoading ? "AI Processing…" : "Analysis Complete"}
              </span>
              {geminiLoading && (
                <span style={{ fontSize: 10, color: "#4b5563", marginLeft: "auto" }} className="pulse">
                  Analyzing live disaster data…
                </span>
              )}
            </div>
            <AIThinkingPanel isRunning={geminiLoading} currentStep={thinkingStep} />
          </div>
        )}

        {/* Gemini response with typewriter */}
        {(displayedText || geminiResponse) && !geminiLoading && (
          <div className="fade-up" style={{ background: "#0d1117", border: "1px solid #1a2a4a", borderRadius: 16, padding: 24 }}>
            <div className="flex items-center gap-2 mb-4">
              <Brain size={15} style={{ color: "#60a5fa" }} />
              <span className="rj" style={{ fontWeight: 700, fontSize: 15, color: "#f0f4fa" }}>Gemini Field Report</span>
              <span style={{ marginLeft: "auto", fontSize: 9, color: "#374151", fontFamily: "'Rajdhani',sans-serif", letterSpacing: "0.1em" }}>
                CLASSIFIED · AI GENERATED
              </span>
            </div>
            <div
              className="gemini-output"
              style={{ fontSize: 12, color: "#d1d5db", lineHeight: 1.8 }}
              dangerouslySetInnerHTML={{ __html: displayedText || formatGeminiOutput(geminiResponse) }}
            />
            {typewriterRef.current && <span className="typewriter-cursor" />}
          </div>
        )}

        {/* Priority chart */}
        <div className="card-lift" style={{ background: "#0d1117", border: "1px solid #1f2937", borderRadius: 16, padding: 24, flex: 1 }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="rj" style={{ fontWeight: 700, fontSize: 17, color: "#f0f4fa", marginBottom: 4 }}>Live Priority Queue</h2>
              <p style={{ fontSize: 12, color: "#4b5563" }}>Real-time scoring of all active zones</p>
            </div>
            <div className="sync-badge">
              <span className="live-dot" />
              UPDATING
            </div>
          </div>
          <ResponsiveContainer width="100%" height={520}>
            <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 40, left: 100, bottom: 0 }} barSize={11}>
              <XAxis type="number" domain={[0, 100]} tick={{ fill: "#4b5563", fontSize: 10 }} axisLine={{ stroke: "#1f2937" }} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: "#9ca3af", fontSize: 11, fontFamily: "'DM Sans',sans-serif" }} axisLine={false} tickLine={false} width={96} />
              <RTooltip contentStyle={{ background: "#0d1117", border: "1px solid #374151", borderRadius: 8, color: "#f0f4fa", fontSize: 11 }}
                formatter={(v) => [v.toFixed(1) + " pts", "Priority Score"]} />
              <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                {chartData.map((e, i) => <Cell key={i} fill={e.fill} opacity={0.88} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AIPriority;
