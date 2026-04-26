import { useState } from "react";
import { Users, UserPlus, Search, MapPin, X, Crosshair, Zap, ChevronDown } from "lucide-react";
import { ALLSKILLS } from "../data/personnel";
import { SkillBadge, StatusBadge, PageHeader } from "../components/SharedComponents";
import { useStore } from "../store";

const extractSkills = (text) => {
  const lower = text.toLowerCase();
  const found = [];
  if (lower.includes("medic") || lower.includes("doctor") || lower.includes("nurse")) found.push("Medical");
  if (lower.includes("boat") || lower.includes("swim") || lower.includes("rescue")) found.push("Rescue");
  if (lower.includes("food") || lower.includes("supply")) found.push("Logistics");
  if (lower.includes("drone") || lower.includes("tech") || lower.includes("radio")) found.push("Communications");
  if (lower.includes("engineer") || lower.includes("build") || lower.includes("repair")) found.push("Engineering");
  return found.length > 0 ? found : ["Logistics"]; // fallback
};

const Personnel = ({ showToast }) => {
  const { personnel, setPersonnel, zones } = useStore();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newP, setNewP] = useState({ name: "", description: "", skills: [], lat: "", lng: "", status: "Available" });
  const [suggestion, setSuggestion] = useState(null);
  const [displayLimit, setDisplayLimit] = useState(8);

  // Sorting logic: Available first, then by number of skills (more is better)
  const sortedPersonnel = [...personnel].sort((a, b) => {
    if (a.status === "Available" && b.status !== "Available") return -1;
    if (a.status !== "Available" && b.status === "Available") return 1;
    return b.skills.length - a.skills.length;
  });

  const filtered = sortedPersonnel.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.skills.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  const displayedPersonnel = filtered.slice(0, displayLimit);

  const handleDescChange = (e) => {
    const desc = e.target.value;
    setNewP({ ...newP, description: desc, skills: extractSkills(desc) });
  };

  const detectLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setNewP({ ...newP, lat: pos.coords.latitude.toFixed(4), lng: pos.coords.longitude.toFixed(4) }),
        (err) => showToast("Location denied. Using default.")
      );
    }
  };

  const calculateMatch = () => {
    // score = skill_match * severity * proximity (mocked proximity)
    const scored = zones.map(z => {
      const skillMatch = newP.skills.some(s => 
        (z.disaster_type === 'flood' && s === 'Rescue') ||
        (z.disaster_type === 'earthquake' && s === 'Medical') ||
        (z.disaster_type === 'cyclone' && s === 'Logistics')
      ) ? 1.5 : 1;
      
      const prox = 1; // Simplified proximity for demo
      return { zone: z, score: skillMatch * z.severity * prox };
    }).sort((a, b) => b.score - a.score);

    setSuggestion(scored[0]);
  };

  const addVol = () => {
    if (!newP.name.trim()) return;
    const finalSkills = newP.skills.length ? newP.skills : ["Rescue"];
    setPersonnel(prev => [{
      id: Date.now(), name: newP.name, 
      skills: finalSkills,
      lat: +newP.lat || 22, lng: +newP.lng || 78,
      status: suggestion ? "Deployed" : "Available"
    }, ...prev]);
    showToast(`${newP.name} registered ${suggestion ? `and deployed to ${suggestion.zone.name}` : ''}`);
    setShowModal(false);
    setNewP({ name: "", description: "", skills: [], lat: "", lng: "", status: "Available" });
    setSuggestion(null);
  };

  return (
    <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="flex items-center justify-between">
        <PageHeader icon={Users} iconBg="#1e3a5f" title="Personnel Directory" subtitle="Manage emergency response volunteers and their skills." />
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-xl font-semibold text-sm micro-press"
          style={{ background: "#1d4ed8", color: "#fff", border: "none", cursor: "pointer", fontSize: 13, padding: "10px 16px", borderRadius: 12 }}>
          <UserPlus size={14} />Register Volunteer
        </button>
      </div>

      <div className="relative" style={{ maxWidth: 320 }}>
        <Search size={13} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#4b5563" }} />
        <input placeholder="Search name or skill…" value={search} onChange={e => setSearch(e.target.value)}
          style={{ width: "100%", background: "#0d1117", border: "1px solid #1f2937", borderRadius: 10, padding: "8px 12px 8px 32px", fontSize: 13, color: "#f0f4fa", outline: "none" }} />
      </div>

      <div style={{ background: "#0d1117", border: "1px solid #1f2937", borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #111827", background: "#0f172a" }}>
              {["Name", "Skills", "Location", "Status"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, color: "#64748b", fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, letterSpacing: "0.08em" }}>{h.toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayedPersonnel.map((p, i) => (
              <tr key={p.id} className="micro-hover" style={{ borderBottom: "1px solid #0a0e1a", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,.01)" }}>
                <td style={{ padding: "10px 16px", fontWeight: 500, fontSize: 13, color: "#e2e8f0" }}>{p.name}</td>
                <td style={{ padding: "10px 16px" }}><div className="flex flex-wrap gap-1">{p.skills.map(s => <SkillBadge key={s} skill={s} />)}</div></td>
                <td style={{ padding: "10px 16px", fontSize: 12, color: "#9ca3af" }}>
                  <div className="flex items-center gap-1"><MapPin size={10} style={{ color: "#4b5563" }} />{p.lat?.toFixed(2)}, {p.lng?.toFixed(2)}</div>
                </td>
                <td style={{ padding: "10px 16px" }}><StatusBadge s={p.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filtered.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", color: "#64748b", fontSize: 13 }}>No results found</div>
        ) : filtered.length > displayLimit ? (
          <div style={{ padding: 12, display: "flex", justifyContent: "center", borderTop: "1px solid #111827", background: "#0f172a" }}>
            <button onClick={() => setDisplayLimit(l => l + 8)} className="flex items-center gap-1 micro-press" style={{ background: "transparent", border: "none", color: "#60a5fa", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              View More <ChevronDown size={14} />
            </button>
          </div>
        ) : null}
      </div>

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="fade-up" style={{ background: "#0d1117", border: "1px solid #1f2937", borderRadius: 16, padding: 28, width: 440 }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="rj" style={{ fontWeight: 700, fontSize: 17, color: "#f0f4fa" }}>Register New Volunteer</h3>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#4b5563" }}><X size={16} /></button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: "#9ca3af", marginBottom: 5, display: "block" }}>Full Name</label>
                <input value={newP.name} onChange={e => setNewP({ ...newP, name: e.target.value })}
                  style={{ width: "100%", background: "#060a13", border: "1px solid #1f2937", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#f0f4fa", outline: "none" }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "#9ca3af", marginBottom: 5, display: "block" }}>Tell us about yourself (Auto-tags skills)</label>
                <textarea 
                  placeholder="e.g. I am a doctor and I brought my own boat..."
                  value={newP.description} onChange={handleDescChange}
                  style={{ width: "100%", background: "#060a13", border: "1px solid #1f2937", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#f0f4fa", outline: "none", minHeight: 60, resize: "vertical" }} 
                />
                {newP.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {newP.skills.map(s => <SkillBadge key={s} skill={s} />)}
                  </div>
                )}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div><label style={{ fontSize: 12, color: "#9ca3af", marginBottom: 5, display: "block" }}>Latitude</label><input value={newP.lat} onChange={e => setNewP({ ...newP, lat: e.target.value })} style={{ width: "100%", background: "#060a13", border: "1px solid #1f2937", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#f0f4fa", outline: "none" }} /></div>
                <div><label style={{ fontSize: 12, color: "#9ca3af", marginBottom: 5, display: "block" }}>Longitude</label><input value={newP.lng} onChange={e => setNewP({ ...newP, lng: e.target.value })} style={{ width: "100%", background: "#060a13", border: "1px solid #1f2937", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#f0f4fa", outline: "none" }} /></div>
              </div>
              <button onClick={detectLocation} className="micro-press" style={{ background: "rgba(59,130,246,.1)", border: "1px solid #1e3a8a", color: "#60a5fa", padding: "6px", borderRadius: 8, fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <Crosshair size={12} /> Auto-Detect Location
              </button>

              <button onClick={calculateMatch} className="micro-press" style={{ background: "#1e293b", border: "1px solid #334155", color: "#e2e8f0", padding: "10px", borderRadius: 8, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 10 }}>
                <Zap size={14} style={{ color: "#fbbf24" }} /> Smart Deployment Match
              </button>

              {suggestion && (
                <div className="fade-up" style={{ background: "rgba(16,185,129,.1)", border: "1px solid rgba(16,185,129,.3)", padding: 12, borderRadius: 8 }}>
                  <p style={{ fontSize: 11, color: "#10b981", fontWeight: 600, marginBottom: 4 }}>RECOMMENDED DEPLOYMENT</p>
                  <p style={{ fontSize: 13, color: "#f0f4fa" }}>{suggestion.zone.name}</p>
                  <p style={{ fontSize: 10, color: "#a7f3d0" }}>Match Score: {suggestion.score.toFixed(1)}</p>
                </div>
              )}

              <button onClick={addVol} className="micro-press"
                style={{ width: "100%", padding: "12px", borderRadius: 10, background: suggestion ? "#059669" : "#1d4ed8", color: "#fff", border: "none", cursor: "pointer", fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: "0.05em", marginTop: 4 }}>
                {suggestion ? "Deploy Instantly" : "Register Volunteer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Personnel;
