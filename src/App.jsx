import { useState, useEffect, useCallback } from "react";
import { useStore } from "./store";

/* ─── COMPONENTS ──────────────────────────────────────────────────────────── */
import { Toast } from "./components/SharedComponents";
import AlertTicker from "./components/AlertTicker";
import Sidebar from "./components/Sidebar";
import { CrisisBanner, CrisisOverlay } from "./components/WowFeatures";
import { VoiceCommand } from "./components/VoiceCommand";

/* ─── PAGES ───────────────────────────────────────────────────────────────── */
import Landing from "./pages/Landing";
import CommandCenter from "./pages/CommandCenter";
import ReportIncident from "./pages/ReportIncident";
import Personnel from "./pages/Personnel";
import Simulate from "./pages/Simulate";
import AIPriority from "./pages/AIPriority";
import PredictPage from "./pages/PredictPage.jsx";

export default function App() {
  const { zones, crisisMode, setZones, simulationActive } = useStore();
  const [page, setPage] = useState("landing");
  const [toast, setToast] = useState(null);
  const [dashboardEntered, setDashboardEntered] = useState(false);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  /* ─── REAL-TIME FEEL: micro severity updates every 8s ────────────────── */
  useEffect(() => {
    if (page === "landing" || simulationActive) return;
    const interval = setInterval(() => {
      setZones(prev => prev.map(z => {
        const delta = (Math.random() - 0.45) * 0.15; // slight bias upward
        const newSev = Math.max(1, Math.min(10, +(z.severity + delta).toFixed(1)));
        return { ...z, severity: newSev };
      }));
    }, 8000);
    return () => clearInterval(interval);
  }, [page, simulationActive, setZones]);

  /* ─── CINEMATIC ENTRY ────────────────────────────────────────────────── */
  const handleLaunch = useCallback(() => {
    setPage("dashboard");
    setTimeout(() => setDashboardEntered(true), 100);
  }, []);

  /* ─── LANDING ───────────────────────────────────────────────────────────── */
  if (page === "landing") {
    return (
      <>
        <Landing onLaunch={handleLaunch} />
        {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
      </>
    );
  }

  /* ─── DASHBOARD PAGES ───────────────────────────────────────────────────── */
  const pageContent = {
    dashboard: <CommandCenter showToast={showToast} />,
    report: <ReportIncident showToast={showToast} />,
    personnel: <Personnel showToast={showToast} />,
    simulate: <Simulate />,
    predict: <PredictPage />,
    priority: <AIPriority />,
  };

  return (
    <>
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}

      <CrisisOverlay active={crisisMode} />
      <CrisisBanner zones={zones} />
      <VoiceCommand />

      <div className={`${dashboardEntered ? "cinematic-enter" : ""} ${crisisMode ? "crisis-active" : ""}`}
        style={{ display: "flex", background: "#07090f", minHeight: "100vh", flexDirection: "column" }}>
        <AlertTicker crisisMode={crisisMode} />
        <div style={{ display: "flex", flex: 1 }}>
          <Sidebar page={page} setPage={setPage} crisisMode={crisisMode} />
          <main style={{ flex: 1, padding: 24, overflowY: "auto", minWidth: 0, position: "relative" }}>
            {pageContent[page] || <CommandCenter showToast={showToast} />}
          </main>
        </div>
      </div>
    </>
  );
}
