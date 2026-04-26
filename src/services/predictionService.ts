import type { OpenMeteoResponse, USGSResponse } from '../types/prediction';

export const INDIAN_CITIES = [
  { name: "Patna", lat: 25.5941, lng: 85.1376 },
  { name: "Mumbai", lat: 19.0760, lng: 72.8777 },
  { name: "Chennai", lat: 13.0827, lng: 80.2707 },
  { name: "Kolkata", lat: 22.5726, lng: 88.3639 },
  { name: "Bhubaneswar", lat: 20.2961, lng: 85.8245 },
  { name: "Guwahati", lat: 26.1445, lng: 91.7362 },
  { name: "Ahmedabad", lat: 23.0225, lng: 72.5714 },
  { name: "Hyderabad", lat: 17.3850, lng: 78.4867 },
  { name: "Jaipur", lat: 26.9124, lng: 75.7873 },
  { name: "Visakhapatnam", lat: 17.6868, lng: 83.2185 }
];

export async function fetchAllPredictionData() {
  try {
    const weatherPromises = INDIAN_CITIES.map(async (city) => {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lng}&hourly=precipitation,windspeed_10m,temperature_2m,precipitation_probability,weathercode&forecast_days=3`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Weather API error for ${city.name}`);
      const data: OpenMeteoResponse = await res.json();
      return { city, weatherData: data };
    });

    const weatherResults = await Promise.all(weatherPromises);

    // Fetch Earthquakes
    const eqUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson';
    const eqRes = await fetch(eqUrl);
    if (!eqRes.ok) throw new Error('USGS API error');
    const allEqData: USGSResponse = await eqRes.json();

    // Filter earthquakes within India bounding box (roughly lat 8-37, lng 68-97)
    const indiaEqData = {
      ...allEqData,
      features: allEqData.features.filter(f => {
        const [lng, lat] = f.geometry.coordinates;
        return lat >= 8 && lat <= 37 && lng >= 68 && lng <= 97;
      })
    };

    return {
      weatherResults,
      earthquakeData: indiaEqData
    };
  } catch (error) {
    console.error("Error fetching prediction data:", error);
    throw error;
  }
}
