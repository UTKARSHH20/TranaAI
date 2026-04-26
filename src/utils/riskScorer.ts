import type { OpenMeteoResponse, USGSResponse, CityRiskScore } from '../types/prediction';

// Helper: Calculate distance between two coords using Haversine formula
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c; // Distance in km
}

export function calculateRiskScore(
  weatherData: OpenMeteoResponse,
  earthquakeData: USGSResponse,
  cityName: string
): CityRiskScore {
  let floodRisk = 0;
  let cycloneRisk = 0;
  let heatwaveRisk = 0;
  let earthquakeRisk = 0;

  const hourly = weatherData.hourly;
  const numHours = hourly.time.length;

  // Aggregate weather metrics
  let totalPrecipitation = 0;
  let maxWindspeed = 0;
  let maxTemp = -100;
  let totalPrecipProb = 0;
  let hasStormCode = false;

  const stormCodes = new Set([65, 66, 75, 77, 82, 95, 96, 99]);

  for (let i = 0; i < numHours; i++) {
    totalPrecipitation += hourly.precipitation[i] || 0;
    totalPrecipProb += hourly.precipitation_probability[i] || 0;
    if (hourly.windspeed_10m[i] > maxWindspeed) maxWindspeed = hourly.windspeed_10m[i];
    if (hourly.temperature_2m[i] > maxTemp) maxTemp = hourly.temperature_2m[i];
    if (stormCodes.has(hourly.weathercode[i])) hasStormCode = true;
  }

  const avgPrecipProb = numHours > 0 ? totalPrecipProb / numHours : 0;

  /* FLOOD RISK (weight: 40%) */
  const floodProneCities = new Set(["Patna", "Mumbai", "Bhubaneswar", "Guwahati", "Kolkata"]);
  let rawFlood = 0;
  if (avgPrecipProb > 70) rawFlood += 40;
  if (totalPrecipitation > 100) rawFlood += 30;
  else if (totalPrecipitation > 50) rawFlood += 15;
  if (floodProneCities.has(cityName)) rawFlood += 10;
  floodRisk = Math.min(rawFlood, 100) * 0.40;

  /* CYCLONE RISK (max 25) */
  let rawCyclone = 0;
  if (maxWindspeed > 60) rawCyclone += 25;
  const coastalCities = new Set(["Chennai", "Visakhapatnam", "Mumbai", "Bhubaneswar"]);
  if (coastalCities.has(cityName)) rawCyclone += 10;
  if (hasStormCode) rawCyclone += 20;
  cycloneRisk = Math.min(rawCyclone, 100) * 0.25;

  /* HEATWAVE RISK (max 20) */
  let rawHeat = 0;
  if (maxTemp > 42) rawHeat += 20;
  else if (maxTemp > 38) rawHeat += 10;
  const aridCities = new Set(["Jaipur", "Ahmedabad"]);
  if (aridCities.has(cityName)) rawHeat += 5;
  heatwaveRisk = Math.min(rawHeat, 100) * 0.20;

  /* EARTHQUAKE RISK (max 15) */
  let rawEq = 0;
  const lat = weatherData.latitude;
  const lng = weatherData.longitude;
  for (const feature of earthquakeData.features) {
    const eqLng = feature.geometry.coordinates[0];
    const eqLat = feature.geometry.coordinates[1];
    const dist = getDistanceFromLatLonInKm(lat, lng, eqLat, eqLng);
    if (dist <= 200) {
      rawEq += 30;
      if (feature.properties.mag > 5.5) rawEq += 30;
      else if (feature.properties.mag > 4.5) rawEq += 20;
      break; // Only need the most significant or one occurrence for the bonus
    }
  }
  earthquakeRisk = Math.min(rawEq, 100) * 0.15;

  let overallRisk = floodRisk + cycloneRisk + heatwaveRisk + earthquakeRisk;
  overallRisk = Math.min(100, Math.max(0, overallRisk));

  // Determine primary threat
  const risks = [
    { type: "flood" as const, val: floodRisk },
    { type: "cyclone" as const, val: cycloneRisk },
    { type: "heatwave" as const, val: heatwaveRisk },
    { type: "earthquake" as const, val: earthquakeRisk }
  ];
  risks.sort((a, b) => b.val - a.val);
  
  const primaryThreat = risks[0].val > 5 ? risks[0].type : "low";

  // Determine risk level
  let riskLevel: "CRITICAL" | "HIGH" | "MODERATE" | "LOW" = "LOW";
  if (overallRisk >= 70) riskLevel = "CRITICAL";
  else if (overallRisk >= 50) riskLevel = "HIGH";
  else if (overallRisk >= 30) riskLevel = "MODERATE";

  return {
    cityName,
    lat,
    lng,
    overallRisk,
    floodRisk,
    cycloneRisk,
    heatwaveRisk,
    earthquakeRisk,
    primaryThreat,
    riskLevel,
    forecastData: {
      avgPrecipProb: avgPrecipProb.toFixed(1),
      totalPrecipitation: totalPrecipitation.toFixed(1),
      maxWindspeed: maxWindspeed.toFixed(1),
      maxTemp: maxTemp.toFixed(1)
    }
  };
}
