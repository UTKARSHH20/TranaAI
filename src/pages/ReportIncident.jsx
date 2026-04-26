import { useState } from "react";
import { Shield } from "lucide-react";
import { PageHeader } from "../components/SharedComponents";
import { useStore } from "../store";

const ReportIncident = ({ showToast }) => {
  const { setZones, zones, personnel } = useStore();
  const [form, setForm] = useState({ name: "", lat: "20.5937", lng: "78.9629", type: "flood", severity: 5, pop: "1000", res: "100" });

  const submit = () => {
    if (!form.name.trim()) return;
    const z = {
      id: Date.now(), name: form.name, lat: +form.lat, lng: +form.lng,
      severity: form.severity, disaster_type: form.type, type: form.type, 
      population: +form.pop, pop: +form.pop,
      resources: +form.res, res: +form.res,
      trend: +(Math.random() * 1 - 0.2).toFixed(1),
      severity_growth_rate: 0.5
    };
    setZones(prev => [...prev, z]);
    showToast(`Incident reported for ${form.name}`);
    setForm({ name: "", lat: "20.5937", lng: "78.9629", type: "flood", severity: 5, pop: "1000", res: "100" });
  };

  const inpStyle = { background: "#060a13", border: "1px solid #1f2937", color: "#f0f4fa", outline: "none", width: "100%", borderRadius: 12, padding: "10px 16px", fontSize: 14 };
  const lbl = { fontSize: 13, color: "#9ca3af", marginBottom: 6, display: "block" };

  return (
    <div className="fade-up" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 900 }}>
      <div className="card-lift" style={{ background: "#0d1117", border: "1px solid #1f2937", borderRadius: 16, padding: 28 }}>
        <PageHeader icon={Shield} iconBg="#7f1d1d" title="Disaster Input Panel" subtitle="Log new incidents for AI analysis and resource allocation." />
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={lbl}>Location Name</label>
            <input style={inpStyle} placeholder="e.g. Mumbai Coastal Sector" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><label style={lbl}>Latitude</label><input style={inpStyle} value={form.lat} onChange={e => setForm({ ...form, lat: e.target.value })} /></div>
            <div><label style={lbl}>Longitude</label><input style={inpStyle} value={form.lng} onChange={e => setForm({ ...form, lng: e.target.value })} /></div>
          </div>
          <div>
            <label style={lbl}>Disaster Type</label>
            <select style={{ ...inpStyle, cursor: "pointer" }} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              {["flood", "earthquake", "landslide", "cyclone", "fire", "drought", "other"].map(t =>
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              )}
            </select>
          </div>
          <div>
            <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
              <label style={lbl}>Severity Assessment</label>
              <span style={{ fontSize: 13, color: "#3b82f6", fontWeight: 600 }}>{form.severity}/10</span>
            </div>
            <input type="range" min={1} max={10} step={1} value={form.severity} onChange={e => setForm({ ...form, severity: +e.target.value })} style={{ width: "100%" }} />
            <div className="flex justify-between" style={{ fontSize: 10, color: "#4b5563", marginTop: 4, display: "flex", justifyContent: "space-between" }}>
              <span>Monitor</span><span>Critical</span>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><label style={lbl}>Affected Population</label><input style={inpStyle} value={form.pop} onChange={e => setForm({ ...form, pop: e.target.value })} /></div>
            <div><label style={lbl}>Est. Resources Needed</label><input style={inpStyle} value={form.res} onChange={e => setForm({ ...form, res: e.target.value })} /></div>
          </div>
          <button onClick={submit} className="w-full micro-press"
            style={{
              padding: "12px", borderRadius: 12, background: "linear-gradient(135deg,#1d4ed8,#2563eb)",
              color: "#fff", border: "none", cursor: "pointer", fontSize: 14,
              fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, letterSpacing: "0.05em", marginTop: 4
            }}>
            Submit Incident Report
          </button>
        </div>
      </div>

      <div className="card-lift" style={{ background: "#0d1117", border: "1px solid #1f2937", borderRadius: 16, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, gap: 12 }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(59,130,246,.1)", border: "1px solid #1d3557", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Shield size={24} style={{ color: "#3b82f6", opacity: 0.5 }} />
        </div>
        <p style={{ fontSize: 13, color: "#4b5563", textAlign: "center", maxWidth: 220, lineHeight: 1.6 }}>
          Submit an incident report to trigger AI analysis and immediate resource allocation to the affected zone.
        </p>
        <div style={{ width: "100%", maxWidth: 280, borderRadius: 12, padding: 16, background: "#060a13", border: "1px solid #111827", marginTop: 8 }}>
          <p style={{ fontSize: 10, color: "#374151", fontFamily: "'Rajdhani',sans-serif", fontWeight: 600, letterSpacing: "0.1em", marginBottom: 10 }}>CURRENT STATS</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[["Zones Monitored", zones.length], ["Critical", zones.filter(z=>z.severity>=8).length], ["Volunteers", personnel.length], ["Deployed", personnel.filter(p=>p.status==="Deployed").length]].map(([l, v]) => (
              <div key={l} style={{ background: "#0a0e1a", borderRadius: 8, padding: "10px 12px" }}>
                <div style={{ fontSize: 18, fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, color: "#f0f4fa" }}>{v}</div>
                <div style={{ fontSize: 10, color: "#4b5563" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportIncident;
