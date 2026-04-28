import { create } from 'zustand';
import { ZONE_DATA } from '../data/zones';
import { makePersonnel } from '../data/personnel';
import { computeP } from '../utils/helpers';

export const useStore = create((set, get) => ({
  zones: ZONE_DATA.map(z => ({
    ...z,
    population: z.pop,
    resources: z.res,
    severity_growth_rate: z.trend > 0 ? z.trend : 0,
    disaster_type: z.type
  })),
  personnel: makePersonnel(),
  crisisMode: false,
  weights: { sev: 0.40, pop: 0.20, res: 0.20, trend: 0.20 },
  aiAllocations: [],
  mapPolylines: [],
  simulationActive: false,
  stateHistory: [],
  isReplaying: false,

  updateWeight: (key, value) => set((state) => ({
    weights: { ...state.weights, [key]: value }
  })),

  setZones: (updater) => set((state) => {
    const newZones = typeof updater === 'function' ? updater(state.zones) : updater;
    const crisis = newZones.some(z => z.severity >= 8.5);
    // Keep last 10 states for replay
    const newHistory = [...state.stateHistory, { zones: state.zones, polylines: state.mapPolylines, personnel: state.personnel }].slice(-10);
    return { zones: newZones, crisisMode: crisis, stateHistory: newHistory };
  }),

  setPersonnel: (updater) => set((state) => ({
    personnel: typeof updater === 'function' ? updater(state.personnel) : updater
  })),

  updateZoneSeverity: (id, newSeverity) => set((state) => {
    const newZones = state.zones.map(z => 
      z.id === id ? { ...z, severity: newSeverity } : z
    );
    const crisis = newZones.some(z => z.severity >= 8.5);
    const newHistory = [...state.stateHistory, { zones: state.zones, polylines: state.mapPolylines, personnel: state.personnel }].slice(-10);
    return { zones: newZones, crisisMode: crisis, stateHistory: newHistory };
  }),

  toggleSimulation: () => set(state => ({ simulationActive: !state.simulationActive })),

  runAIAllocation: () => {
    const state = get();
    const { zones, personnel, weights } = state;
    
    // Save state before modifying
    const newHistory = [...state.stateHistory, { zones, polylines: state.mapPolylines, personnel }].slice(-10);

    const scoredZones = [...zones].map(z => ({
      ...z,
      score: computeP({ ...z, pop: z.population, res: z.resources, type: z.disaster_type }, weights)
    })).sort((a, b) => b.score - a.score);

    const topZones = scoredZones.slice(0, 3); // Only top 3 for flow lines
    const newPolylines = [];
    const newPersonnel = [...personnel];

    const allocations = topZones.map((z) => {
      const assigned = [];
      for (let i = 0; i < 3; i++) {
        const pIndex = newPersonnel.findIndex(p => p.status === 'Available');
        if (pIndex !== -1) {
          newPersonnel[pIndex].status = 'Deployed';
          assigned.push(newPersonnel[pIndex]);
          
          newPolylines.push({
            id: `line-${z.id}-${newPersonnel[pIndex].id}`,
            origin: { lat: newPersonnel[pIndex].lat, lng: newPersonnel[pIndex].lng },
            destination: { lat: z.lat, lng: z.lng },
            color: '#06b6d4' // Cyan for all flows, not red
          });
        }
      }
      return { zone: z, personnel: assigned, score: z.score.toFixed(0) };
    });

    set({ 
      aiAllocations: allocations, 
      mapPolylines: newPolylines,
      personnel: newPersonnel,
      stateHistory: newHistory
    });
  },

  triggerReplay: async () => {
    const state = get();
    if (state.stateHistory.length === 0 || state.isReplaying) return;
    
    set({ isReplaying: true });
    
    const currentSnapshot = { zones: state.zones, mapPolylines: state.mapPolylines, personnel: state.personnel };
    const history = [...state.stateHistory];
    
    for (const snap of history) {
      set({ zones: snap.zones, mapPolylines: snap.polylines, personnel: snap.personnel });
      await new Promise(r => setTimeout(r, 600));
    }
    
    // Restore current
    set({ 
      zones: currentSnapshot.zones, 
      mapPolylines: currentSnapshot.mapPolylines, 
      personnel: currentSnapshot.personnel,
      isReplaying: false 
    });
  },

  /* ─── PREDICTION ENGINE ─────────────────────────────────────────────────── */
  predictionState: {
    predictions: [],
    geminiReasoning: null,
    isLoading: false,
    lastUpdated: null,
    error: null
  },

  fetchPredictions: async (apiKey) => {
    set(state => ({
      predictionState: { ...state.predictionState, isLoading: true, error: null }
    }));

    try {
      // Dynamic imports to keep initial bundle size down if needed, or just import at the top.
      // But we are in a JS file, let's use dynamic imports for the TS services
      const { fetchAllPredictionData } = await import('../services/predictionService');
      const { calculateRiskScore } = await import('../utils/riskScorer');
      const { generatePredictionReasoning } = await import('../services/geminiPrediction');

      const { weatherResults, earthquakeData } = await fetchAllPredictionData();
      
      const predictions = weatherResults.map((res) => 
        calculateRiskScore(res.weatherData, earthquakeData, res.city.name)
      ).sort((a, b) => b.overallRisk - a.overallRisk);

      let geminiReasoning = null;
      if (apiKey) {
        geminiReasoning = await generatePredictionReasoning(predictions, apiKey);
      }

      set({
        predictionState: {
          predictions,
          geminiReasoning,
          isLoading: false,
          lastUpdated: new Date(),
          error: null
        }
      });
    } catch (error) {
      set(state => ({
        predictionState: { 
          ...state.predictionState, 
          isLoading: false, 
          error: error.message || "Failed to fetch predictions." 
        }
      }));
    }
  },

  clearPredictions: () => {
    set({
      predictionState: {
        predictions: [],
        geminiReasoning: null,
        isLoading: false,
        lastUpdated: null,
        error: null
      }
    });
  }
}));
