/* ─── DISASTER ZONE DATA ──────────────────────────────────────────────────── */
export const ZONE_DATA = [
  { id: 1, name: "Kolkata", lat: 22.57, lng: 88.36, severity: 8.5, type: "Landslide", pop: 54600, trend: +0.1, res: 12 },
  { id: 2, name: "Pondicherry", lat: 11.93, lng: 79.83, severity: 8.5, type: "Landslide", pop: 318700, trend: -0.3, res: 8 },
  { id: 3, name: "Lucknow", lat: 26.85, lng: 80.95, severity: 8.2, type: "Other", pop: 76900, trend: +0.4, res: 15 },
  { id: 4, name: "Pune", lat: 18.52, lng: 73.86, severity: 7.9, type: "Earthquake", pop: 188100, trend: +0.9, res: 10 },
  { id: 5, name: "Hyderabad", lat: 17.38, lng: 78.49, severity: 7.7, type: "Fire", pop: 80100, trend: +0.2, res: 6 },
  { id: 6, name: "Mumbai", lat: 19.08, lng: 72.88, severity: 7.4, type: "Flood", pop: 142000, trend: -0.1, res: 20 },
  { id: 7, name: "Imphal", lat: 24.82, lng: 93.95, severity: 7.1, type: "Flood", pop: 32000, trend: +0.5, res: 4 },
  { id: 8, name: "Aizawl", lat: 23.73, lng: 92.72, severity: 6.8, type: "Landslide", pop: 28000, trend: +0.3, res: 3 },
  { id: 9, name: "Panaji", lat: 15.50, lng: 73.83, severity: 6.5, type: "Cyclone", pop: 65000, trend: -0.2, res: 9 },
  { id: 10, name: "Indore", lat: 22.72, lng: 75.86, severity: 6.2, type: "Earthquake", pop: 97000, trend: +0.1, res: 11 },
  { id: 11, name: "Visakhapatnam", lat: 17.69, lng: 83.22, severity: 5.9, type: "Cyclone", pop: 115000, trend: +0.4, res: 14 },
  { id: 12, name: "Nagpur", lat: 21.15, lng: 79.09, severity: 5.6, type: "Drought", pop: 88000, trend: -0.1, res: 7 },
  { id: 13, name: "Gangtok", lat: 27.33, lng: 88.61, severity: 5.3, type: "Landslide", pop: 22000, trend: +0.2, res: 2 },
  { id: 14, name: "Kochi", lat: 9.93, lng: 76.26, severity: 9.1, type: "Flood", pop: 71000, trend: +1.2, res: 5 },
  { id: 15, name: "Bengaluru", lat: 12.97, lng: 77.59, severity: 4.8, type: "Flood", pop: 210000, trend: -0.3, res: 18 },
  { id: 16, name: "Bhubaneswar", lat: 20.30, lng: 85.84, severity: 4.5, type: "Cyclone", pop: 95000, trend: +0.1, res: 8 },
  { id: 17, name: "Surat", lat: 21.17, lng: 72.83, severity: 4.2, type: "Flood", pop: 75000, trend: -0.2, res: 6 },
  { id: 18, name: "Ahmedabad", lat: 23.03, lng: 72.59, severity: 3.9, type: "Drought", pop: 180000, trend: 0.0, res: 5 },
  { id: 19, name: "Srinagar", lat: 34.08, lng: 74.80, severity: 3.5, type: "Flood", pop: 45000, trend: -0.4, res: 4 },
  { id: 20, name: "Jaipur", lat: 26.91, lng: 75.79, severity: 5.1, type: "Drought", pop: 130000, trend: +0.3, res: 9 },
  { id: 21, name: "Chennai", lat: 13.08, lng: 80.27, severity: 6.0, type: "Cyclone", pop: 195000, trend: +0.6, res: 16 },
  { id: 22, name: "Amritsar", lat: 31.63, lng: 74.87, severity: 3.2, type: "Flood", pop: 62000, trend: -0.1, res: 3 },
  { id: 23, name: "Bhopal", lat: 23.26, lng: 77.40, severity: 5.4, type: "Other", pop: 89000, trend: +0.2, res: 7 },
  { id: 24, name: "Patna", lat: 25.59, lng: 85.14, severity: 7.3, type: "Flood", pop: 165000, trend: +0.8, res: 11 },
  { id: 25, name: "Varanasi", lat: 25.32, lng: 83.01, severity: 6.1, type: "Flood", pop: 92000, trend: +0.3, res: 8 },
  { id: 26, name: "Guwahati", lat: 26.14, lng: 91.74, severity: 6.7, type: "Flood", pop: 108000, trend: +0.5, res: 10 },
  { id: 27, name: "Raipur", lat: 21.25, lng: 81.63, severity: 4.0, type: "Drought", pop: 73000, trend: -0.2, res: 5 },
  { id: 28, name: "Thiruvananthapuram", lat: 8.52, lng: 76.94, severity: 5.7, type: "Flood", pop: 87000, trend: +0.1, res: 6 },
  { id: 29, name: "Dehradun", lat: 30.32, lng: 78.03, severity: 6.3, type: "Landslide", pop: 56000, trend: +0.4, res: 4 },
  { id: 30, name: "Ranchi", lat: 23.34, lng: 85.31, severity: 4.7, type: "Drought", pop: 67000, trend: -0.1, res: 5 },
];

export const INDIA_GEO = {
  type: "Feature",
  geometry: {
    type: "MultiPolygon",
    coordinates: [
      [[[68.1,23.6],[69.0,22.2],[70.2,22.7],[70.6,22.3],[71.2,21.1],[72.3,21.7],[72.6,20.7],[73.0,20.2],[72.8,18.5],[73.5,16.5],[74.1,15.3],[74.8,14.1],[75.4,11.5],[76.5,10.5],[77.5,8.4],[78.1,8.1],[79.0,9.5],[80.3,11.1],[80.2,12.0],[79.9,14.5],[80.2,16.9],[81.8,17.0],[82.0,18.2],[83.5,19.3],[85.0,19.8],[86.4,20.0],[87.2,21.1],[88.3,21.6],[88.7,22.5],[89.8,22.0],[90.6,22.1],[91.2,22.3],[91.7,22.8],[92.1,23.7],[92.6,23.3],[93.3,24.1],[94.0,23.9],[94.7,25.2],[95.2,26.4],[96.2,27.0],[97.3,27.8],[97.4,28.4],[96.4,28.8],[95.5,27.3],[94.6,26.4],[93.7,25.5],[92.7,25.1],[91.9,25.6],[90.9,25.2],[89.8,26.0],[89.1,26.6],[88.4,26.7],[88.2,27.0],[87.3,26.8],[86.9,26.5],[85.8,26.6],[84.6,27.1],[83.4,27.5],[82.0,27.5],[80.5,28.6],[79.1,29.3],[78.5,30.4],[77.8,31.0],[77.1,31.9],[76.1,32.8],[75.4,33.3],[74.8,34.3],[74.0,34.7],[73.7,33.7],[74.0,32.5],[73.9,31.5],[72.3,31.3],[71.2,29.5],[70.1,28.0],[68.8,25.5],[68.1,23.6]]],
      [[[72.8,20.3],[73.2,20.7],[73.1,21.3],[72.5,21.2],[72.4,20.5],[72.8,20.3]]]
    ]
  }
};

export const TICKER_ITEMS = [
  "🔴 CRITICAL: Kochi — Flood severity 9.1/10 — Immediate response required",
  "🟠 HIGH: Kolkata — Landslide risk rising — 54,600 affected",
  "🟠 HIGH: Pondicherry — Landslide alert — Population: 318,700",
  "🟡 MODERATE: Pune — Earthquake tremors detected — Monitoring active",
  "🟢 UPDATE: Mumbai — Resource convoy dispatched — ETA 2h",
  "🔴 CRITICAL: Lucknow — Escalation trend +0.4 — Reinforcements needed",
  "🟠 HIGH: Patna — Flood rising — Ganga basin warning issued",
  "ℹ️ SYSTEM: AI allocation engine running — Next cycle in 4 min",
];
