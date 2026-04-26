/* ─── PERSONNEL DATA ──────────────────────────────────────────────────────── */
export const NAMES = [
  "Rahul Joshi","Ananya Sharma","Nikhil Singh","Rohan Patel","Kavya Singh",
  "Priya Bose","Krishna Sharma","Ananya Bose","Aarav Verma","Manish Banerjee",
  "Pooja Singh","Ira Naidu","Sai Khan","Sai Das","Diya Bose",
  "Arjun Mehta","Riya Gupta","Vikram Iyer","Divya Nair","Arun Kumar",
  "Meera Reddy","Kiran Shah","Suresh Pillai","Nisha Verma","Deepak Jain",
  "Amit Trivedi","Shreya Ghosh","Rajesh Kumar","Sunita Bose","Mohan Das",
  "Lalita Singh","Farhan Akhtar","Sneha Mukherjee","Tarun Bajaj","Archana Mishra",
  "Vinay Khanna","Geeta Prasad","Sanjay Rao","Nandini Menon","Harish Sinha",
  "Puja Dey","Rohit Malhotra","Aisha Khan","Dinesh Pandey","Rekha Tiwari",
  "Sunil Desai","Mala Krishnan","Bhaskar Rao","Chitra Sundaram","Vijay Anand"
];

export const PLATS = [
  18.82,13.09,34.37,26.98,26.74,13.23,27.48,22.74,33.89,8.47,
  21.13,23.83,18.99,25.92,26.76,19.50,22.30,28.61,15.50,23.26,
  17.38,21.15,12.97,26.85,24.82,23.73,22.57,20.30,21.17,23.03,
  25.59,26.14,21.25,8.52,29.32,23.34,30.32,31.63,28.70,25.32,
  13.08,26.91,17.69,19.08,11.93,25.45,22.00,24.15,16.30,21.50
];

export const PLNGS = [
  72.58,80.09,74.68,75.55,80.68,80.19,88.51,72.73,74.60,77.04,
  81.82,92.72,72.63,91.88,80.89,76.00,70.83,77.21,73.83,77.40,
  78.49,79.09,77.59,80.95,93.95,92.72,88.36,85.84,72.83,72.59,
  85.14,91.74,81.63,76.94,79.15,85.31,78.03,74.87,77.21,83.01,
  80.27,75.79,83.22,72.88,79.83,85.24,82.00,87.30,80.50,74.50
];

export const ALLSKILLS = ["Medical", "Rescue", "Logistics", "Food", "Comms"];

export const SKILL_STYLE = {
  Medical: { bg: "#450a0a", txt: "#fca5a5", dot: "#ef4444" },
  Rescue:  { bg: "#431407", txt: "#fdba74", dot: "#f97316" },
  Logistics: { bg: "#0c1a40", txt: "#93c5fd", dot: "#3b82f6" },
  Food:    { bg: "#052e16", txt: "#86efac", dot: "#22c55e" },
  Comms:   { bg: "#2e1065", txt: "#c4b5fd", dot: "#a855f7" },
};

export const makePersonnel = () =>
  NAMES.map((n, i) => {
    const c = Math.floor(Math.random() * 2) + 1;
    const s = [...ALLSKILLS].sort(() => Math.random() - 0.5).slice(0, c);
    return {
      id: i + 1,
      name: n,
      skills: s,
      lat: PLATS[i] || 20,
      lng: PLNGS[i] || 78,
      status: Math.random() > 0.38 ? "Deployed" : "Available",
    };
  });
