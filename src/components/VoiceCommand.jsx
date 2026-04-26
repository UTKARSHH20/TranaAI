import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Check, X, Loader } from "lucide-react";
import { useStore } from "../store";

export const VoiceCommand = () => {
  // states: 'idle', 'listening', 'processing', 'success', 'error'
  const [state, setState] = useState("idle");
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef(null);
  
  const { runAIAllocation, updateZoneSeverity, zones } = useStore();

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const text = event.results[0][0].transcript.toLowerCase();
        handleCommand(text);
      };

      recognitionRef.current.onerror = () => {
        showFeedback("error", "Command not recognized");
      };

      recognitionRef.current.onend = () => {
        if (state === "listening") {
          setState("idle");
        }
      };
    }
  }, [zones]); // Add zones dependency if needed for dynamic matching later

  const handleCommand = async (text) => {
    setState("processing");
    setTranscript(`Command: "${text}"`);
    
    await new Promise(r => setTimeout(r, 600)); // Simulate NLP processing

    if (text.includes("run") && text.includes("ai")) {
      runAIAllocation();
      showFeedback("success", "AI allocation executed");
    } else if (text.includes("deploy") || text.includes("rescue")) {
      // Mock deploy logic
      runAIAllocation();
      showFeedback("success", "Rescue units deployed");
    } else if (text.includes("increase") && text.includes("severity")) {
      // Find top zone and increase severity
      if (zones.length > 0) {
        const target = zones[0];
        updateZoneSeverity(target.id, Math.min(10, target.severity + 1));
        showFeedback("success", `Severity increased for ${target.name}`);
      } else {
        showFeedback("error", "No active zones found");
      }
    } else {
      showFeedback("error", "Command not recognized");
    }
  };

  const showFeedback = (newState, message) => {
    setState(newState);
    setTranscript(message);
    setTimeout(() => {
      setState("idle");
      setTranscript("");
    }, 3000);
  };

  const toggleListen = () => {
    if (!recognitionRef.current) {
      showFeedback("error", "Speech API not supported");
      return;
    }
    if (state === "idle" || state === "error" || state === "success") {
      setState("listening");
      setTranscript("Listening for command...");
      try {
        recognitionRef.current.start();
      } catch (e) {
        // Handle case where it's already started
      }
    } else if (state === "listening") {
      setState("idle");
      recognitionRef.current.stop();
    }
  };

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", alignItems: "center", gap: 12 }}>
      {/* Toast Feedback */}
      {state !== "idle" && (
        <div className="fade-up" style={{ 
          background: state === "error" ? "#7f1d1d" : state === "success" ? "#166534" : "#1e293b",
          border: `1px solid ${state === "error" ? "#ef4444" : state === "success" ? "#22c55e" : "#334155"}`,
          padding: "8px 16px", borderRadius: 8, fontSize: 13, color: "#f8fafc",
          display: "flex", alignItems: "center", gap: 8,
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
        }}>
          {state === "listening" && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", animation: "pulse 1.5s infinite" }} />}
          {state === "processing" && <Loader size={14} className="spin" />}
          {state === "success" && <Check size={14} style={{ color: "#4ade80" }} />}
          {state === "error" && <X size={14} style={{ color: "#f87171" }} />}
          {transcript}
        </div>
      )}

      {/* Clean Mic Button */}
      <button 
        onClick={toggleListen}
        className="micro-press"
        style={{
          width: 48, height: 48, borderRadius: "50%",
          background: state === "listening" ? "#ef4444" : "#1e293b",
          border: `1px solid ${state === "listening" ? "#dc2626" : "#334155"}`,
          color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", transition: "all 0.2s ease",
          boxShadow: state === "listening" ? "0 0 15px rgba(239,68,68,0.4)" : "0 4px 12px rgba(0,0,0,0.3)"
        }}
      >
        {state === "listening" ? <Mic size={20} /> : <MicOff size={20} color="#94a3b8" />}
      </button>
    </div>
  );
};
