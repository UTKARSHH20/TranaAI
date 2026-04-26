export interface OpenMeteoHourly {
  time: string[];
  precipitation: number[];
  windspeed_10m: number[];
  temperature_2m: number[];
  precipitation_probability: number[];
  weathercode: number[];
}

export interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  hourly: OpenMeteoHourly;
}

export interface USGSFeature {
  properties: {
    mag: number;
    place: string;
    time: number;
  };
  geometry: {
    coordinates: number[];
  };
}

export interface USGSResponse {
  features: USGSFeature[];
}

export interface CityRiskScore {
  cityName: string;
  lat: number;
  lng: number;
  overallRisk: number;
  floodRisk: number;
  cycloneRisk: number;
  heatwaveRisk: number;
  earthquakeRisk: number;
  primaryThreat: "flood" | "cyclone" | "heatwave" | "earthquake" | "low";
  riskLevel: "CRITICAL" | "HIGH" | "MODERATE" | "LOW";
  forecastData: any; // Raw weather summary for Gemini
}

export interface GeminiThreat {
  city: string;
  threat: string;
  reasoning: string;
  action: string;
  confidence: number;
}

export interface GeminiPredictionResponse {
  topThreats: GeminiThreat[];
  nationalSummary: string;
}

export interface PredictionState {
  predictions: CityRiskScore[];
  geminiReasoning: GeminiPredictionResponse | null;
  isLoading: boolean;
  lastUpdated: Date | null;
  error: string | null;
}
