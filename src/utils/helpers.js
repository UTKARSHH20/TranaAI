/* ─── UTILITY FUNCTIONS ───────────────────────────────────────────────────── */

export const sevColor = (s) =>
  s >= 8 ? "#ef4444" : s >= 6 ? "#f97316" : s >= 4 ? "#eab308" : "#22c55e";

export const sevLabel = (s) =>
  s >= 8 ? "Critical" : s >= 6 ? "High" : s >= 4 ? "Medium" : "Low";

export const fmtPop = (n) => {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(0) + "k";
  return n;
};

export const computeP = (z, w) => {
  const S = z.severity / 10;
  const Pop = Math.min(z.pop / 400000, 1);
  const Gap = Math.min((20 - z.res) / 20, 1);
  const T = Math.min(Math.max(z.trend, 0) / 2, 1);
  return +(w.sev * S + w.pop * Pop + w.res * Gap + w.trend * T).toFixed(4) * 100;
};

/** Animated counter hook value */
export const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);
