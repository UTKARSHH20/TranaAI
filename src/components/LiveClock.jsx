import { useState, useEffect } from "react";

const LiveClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 600, fontSize: 13, color: "#4b5563", letterSpacing: "0.06em" }}>
      {time.toLocaleTimeString("en-IN", { hour12: false })} IST
    </span>
  );
};

export default LiveClock;
