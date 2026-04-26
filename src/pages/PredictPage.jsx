import { useEffect, useState } from "react";
import { useStore } from "../store";
import { AlertTriangle, TrendingUp, RefreshCw, Brain, Droplets, Wind, Thermometer, Activity, CheckCircle } from "lucide-react";
import GoogleIndiaMap from "../components/GoogleIndiaMap";

const threatIcons = {
  flood: Droplets,
  cyclone: Wind,
  heatwave: Thermometer,
  earthquake: Activity,
  low: CheckCircle
};

const riskColors = {
  CRITICAL: "#ef4444",
  HIGH: "#f97316",
  MODERATE: "#eab308",
  LOW: "#22c55e"
};

const PredictPage = () => {
  const { predictionState, fetchPredictions } = useStore();
  const { predictions, geminiReasoning, isLoading, lastUpdated, error } = predictionState;
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_GEMINI_API_KEY || "");
  const [showKey, setShowKey] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);

  // Initial fetch + 10-minute auto-refresh
  useEffect(() => {
    if (predictions.length === 0 && !isLoading) {
      fetchPredictions(apiKey);
    }

    const interval = setInterval(() => {
      fetchPredictions(apiKey);
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    fetchPredictions(apiKey);
  };

  const getThreatIcon = (threat) => {
    const Icon = threatIcons[threat] || Activity;
    return <Icon size={14} />;
  };

  return (
    <div className="fade-up" style={{ display: "grid", gridTemplateColumns: "300px 1fr 340px", gap: 16, height: "100%" }}>
      {/* LEFT PANEL: 72-Hour Risk Forecast */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, overflow: "hidden" }}>
        <div style={{ background: "#0d1117", border: "1px solid #1f2937", borderRadius: 12, display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
          <div style={{ borderBottom: "1px solid #111827", padding: "12px 16px" }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp size={14} style={{ color: "#3b82f6" }} />
                <span style={{ fontSize: 11, letterSpacing: "0.1em", color: "#94a3b8", fontFamily: "'Rajdhani',sans-serif", fontWeight: 700 }}>72-HR FORECAST</span>
              </div>
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="micro-press"
                style={{ background: "transparent", border: "none", color: "#6b7280", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
              >
                <RefreshCw size={12} className={isLoading ? "spin" : ""} />
                <span style={{ fontSize: 10 }}>Refresh</span>
              </button>
            </div>
            {lastUpdated && (
              <div style={{ fontSize: 9, color: "#4b5563" }}>
                Updated: {new Date(lastUpdated).toLocaleTimeString()}
              </div>
            )}
          </div>

          <div style={{ overflowY: "auto", flex: 1, padding: "8px 0" }}>
            {isLoading && predictions.length === 0 ? (
              Array(10).fill(0).map((_, i) => (
                <div key={i} style={{ padding: "12px 16px", borderBottom: "1px solid #0a0e1a", opacity: 0.5 }}>
                  <div style={{ width: "60%", height: 14, background: "#1f2937", borderRadius: 4, marginBottom: 8 }} className="pulse"></div>
                  <div style={{ width: "100%", height: 6, background: "#1f2937", borderRadius: 3 }} className="pulse"></div>
                </div>
              ))
            ) : (
              predictions.map(city => (
                <div
                  key={city.cityName}
                  onClick={() => setSelectedCity(city)}
                  className="cursor-pointer transition-colors micro-hover"
                  style={{
                    borderLeft: `3px solid ${riskColors[city.riskLevel]}`,
                    borderBottom: "1px solid #0a0e1a",
                    background: selectedCity?.cityName === city.cityName ? "rgba(59,130,246,.07)" : "transparent",
                    padding: "12px 16px"
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 600, fontSize: 14, color: "#e2e8f0" }}>
                      {city.cityName}
                    </span>
                    <span style={{ fontSize: 11, color: riskColors[city.riskLevel], fontWeight: 700 }}>
                      {city.overallRisk.toFixed(0)}/100
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-2" style={{ color: "#94a3b8" }}>
                    {getThreatIcon(city.primaryThreat)}
                    <span style={{ fontSize: 10, textTransform: "capitalize" }}>{city.primaryThreat}</span>
                    <span style={{ fontSize: 10, background: riskColors[city.riskLevel] + "33", color: riskColors[city.riskLevel], padding: "2px 6px", borderRadius: 4, marginLeft: "auto" }}>
                      {city.riskLevel}
                    </span>
                  </div>

                  {/* Horizontal Bar Chart for Risk Breakdown */}
                  <div style={{ display: "flex", height: 6, borderRadius: 3, overflow: "hidden", background: "#111827", width: "100%", marginTop: 8 }}>
                    <div style={{ width: `${city.floodRisk}%`, background: "#3b82f6" }} title={`Flood: ${city.floodRisk.toFixed(0)}`}></div>
                    <div style={{ width: `${city.cycloneRisk}%`, background: "#8b5cf6" }} title={`Cyclone: ${city.cycloneRisk.toFixed(0)}`}></div>
                    <div style={{ width: `${city.heatwaveRisk}%`, background: "#f97316" }} title={`Heatwave: ${city.heatwaveRisk.toFixed(0)}`}></div>
                    <div style={{ width: `${city.earthquakeRisk}%`, background: "#ef4444" }} title={`Earthquake: ${city.earthquakeRisk.toFixed(0)}`}></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* CENTER PANEL: Map View */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ background: "#0a0f18", border: "1px solid #1e293b", borderRadius: 12, overflow: "hidden", flex: 1, position: "relative", minHeight: 400 }}>
          <GoogleIndiaMap predictionData={predictions} onSelect={(z) => setSelectedCity(z)} selected={selectedCity} />

          {selectedCity && selectedCity.forecastData && (
            <div className="fade-in" style={{ position: "absolute", bottom: 16, right: 16, background: "rgba(2, 6, 23, 0.9)", backdropFilter: "blur(4px)", border: `1px solid ${riskColors[selectedCity.riskLevel]}`, borderRadius: 8, padding: 16, width: 260 }}>
              <div className="flex items-center justify-between mb-3">
                <span className="rj" style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>{selectedCity.cityName} Detail</span>
                <button onClick={() => setSelectedCity(null)} style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer", fontSize: 16 }}>✕</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                <div style={{ background: "#0f172a", padding: 8, borderRadius: 6, border: "1px solid #1e293b" }}>
                  <div style={{ fontSize: 9, color: "#64748b", marginBottom: 2 }}>PRECIPITATION</div>
                  <div style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 600 }}>{selectedCity.forecastData.totalPrecipitation} mm</div>
                </div>
                <div style={{ background: "#0f172a", padding: 8, borderRadius: 6, border: "1px solid #1e293b" }}>
                  <div style={{ fontSize: 9, color: "#64748b", marginBottom: 2 }}>MAX WIND</div>
                  <div style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 600 }}>{selectedCity.forecastData.maxWindspeed} km/h</div>
                </div>
                <div style={{ background: "#0f172a", padding: 8, borderRadius: 6, border: "1px solid #1e293b" }}>
                  <div style={{ fontSize: 9, color: "#64748b", marginBottom: 2 }}>MAX TEMP</div>
                  <div style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 600 }}>{selectedCity.forecastData.maxTemp} °C</div>
                </div>
                <div style={{ background: "#0f172a", padding: 8, borderRadius: 6, border: "1px solid #1e293b" }}>
                  <div style={{ fontSize: 9, color: "#64748b", marginBottom: 2 }}>RAIN PROB.</div>
                  <div style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 600 }}>{selectedCity.forecastData.avgPrecipProb}%</div>
                </div>
              </div>
              {/* Risk Breakdown */}
              <div style={{ marginTop: 8 }}>
                {[
                  { label: "Flood", val: selectedCity.floodRisk, color: "#3b82f6" },
                  { label: "Cyclone", val: selectedCity.cycloneRisk, color: "#8b5cf6" },
                  { label: "Heatwave", val: selectedCity.heatwaveRisk, color: "#f97316" },
                  { label: "Earthquake", val: selectedCity.earthquakeRisk, color: "#ef4444" }
                ].map(r => (
                  <div key={r.label} className="flex items-center gap-2 mb-1">
                    <span style={{ fontSize: 9, color: "#64748b", width: 60 }}>{r.label}</span>
                    <div style={{ flex: 1, height: 4, background: "#111827", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ width: `${Math.min(r.val, 100)}%`, height: "100%", background: r.color, borderRadius: 2 }}></div>
                    </div>
                    <span style={{ fontSize: 9, color: r.color, width: 24, textAlign: "right" }}>{r.val.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL: AI Prediction Briefing */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, overflowY: "auto" }}>
        {/* API Key Panel */}
        <div className="card-lift" style={{ background: "#0d1117", border: "1px solid #1a2a4a", borderRadius: 12, padding: 16 }}>
          <div className="flex items-center gap-2 mb-3">
            <Brain size={14} style={{ color: "#60a5fa" }} />
            <span className="rj" style={{ fontWeight: 700, fontSize: 13, color: "#f0f4fa" }}>Prediction Settings</span>
          </div>
          <div className="flex gap-2">
            <input
              type={showKey ? "text" : "password"}
              placeholder="Gemini API Key..."
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              style={{ flex: 1, background: "#060a13", border: "1px solid #1f2937", borderRadius: 8, padding: "7px 10px", fontSize: 11, color: "#f0f4fa", outline: "none", fontFamily: "monospace" }}
            />
            <button onClick={() => setShowKey(!showKey)}
              className="micro-press"
              style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 8, padding: "7px 10px", cursor: "pointer", color: "#4b5563", fontSize: 10 }}>
              {showKey ? "Hide" : "Show"}
            </button>
          </div>
          {error && <div style={{ marginTop: 8, fontSize: 10, color: "#fca5a5" }}>{error}</div>}
        </div>

        {geminiReasoning ? (
          <>
            {/* National Summary Command Box */}
            <div className="fade-in" style={{ background: "#1e1b4b", border: "1px solid #3730a3", borderRadius: 12, padding: 16 }}>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={12} style={{ color: "#818cf8" }} />
                <span style={{ fontSize: 10, letterSpacing: "0.1em", color: "#a5b4fc", fontFamily: "'Rajdhani',sans-serif", fontWeight: 700 }}>NATIONAL SUMMARY</span>
              </div>
              <p style={{ fontSize: 12, color: "#e0e7ff", lineHeight: 1.5, fontWeight: 500 }}>
                {geminiReasoning.nationalSummary}
              </p>
            </div>

            {/* Top Threat Cards */}
            {geminiReasoning.topThreats.map((threat, i) => (
              <div key={i} className="fade-up card-lift" style={{ background: "#0d1117", border: "1px solid #1f2937", borderRadius: 12, padding: 16, animationDelay: `${i * 0.1}s` }}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#f0f4fa", fontFamily: "'Rajdhani',sans-serif" }}>
                      {threat.city}
                    </div>
                    <div style={{ fontSize: 11, color: "#fca5a5", display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                      <AlertTriangle size={10} /> {threat.threat.toUpperCase()}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 10, color: "#6b7280", marginBottom: 2 }}>CONFIDENCE</div>
                    <div style={{ fontSize: 12, color: "#22c55e", fontWeight: 700 }}>{threat.confidence}%</div>
                  </div>
                </div>

                {/* Confidence bar */}
                <div style={{ height: 4, background: "#111827", borderRadius: 2, overflow: "hidden", marginBottom: 10 }}>
                  <div style={{ width: `${threat.confidence}%`, height: "100%", background: "linear-gradient(90deg, #22c55e, #3b82f6)", borderRadius: 2 }}></div>
                </div>

                <p style={{ fontSize: 11, color: "#9ca3af", lineHeight: 1.5, marginBottom: 12 }}>
                  {threat.reasoning}
                </p>

                <div style={{ background: "rgba(34, 197, 94, 0.05)", border: "1px solid rgba(34, 197, 94, 0.2)", borderRadius: 6, padding: 10 }}>
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle size={10} style={{ color: "#22c55e" }} />
                    <span style={{ fontSize: 9, color: "#86efac", fontWeight: 600, letterSpacing: "0.05em" }}>RECOMMENDED ACTION</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#d1d5db" }}>
                    {threat.action}
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : (
          <div style={{ background: "#0d1117", border: "1px solid #1f2937", borderRadius: 12, padding: 24, textAlign: "center", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
            <Brain size={32} style={{ color: "#374151", marginBottom: 12 }} className={isLoading ? "pulse" : ""} />
            <div style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 600, marginBottom: 6 }}>
              {isLoading ? "Generating Prediction Briefing..." : "No Briefing Generated"}
            </div>
            <div style={{ fontSize: 11, color: "#6b7280" }}>
              {isLoading ? "Analyzing 72-hour forecast data and earthquake activity..." : "Ensure your API key is provided and refresh to generate an AI predictive briefing."}
            </div>
          </div>
        )}

        <div style={{ fontSize: 10, color: "#4b5563", textAlign: "center", marginTop: "auto", padding: 10 }}>
          Predictions based on Open-Meteo forecast + USGS seismic data. For official warnings, refer to IMD and NDMA.
        </div>
      </div>
    </div>
  );
};

export default PredictPage;
