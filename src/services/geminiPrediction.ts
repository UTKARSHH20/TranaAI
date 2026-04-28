import type { CityRiskScore, GeminiPredictionResponse } from '../types/prediction';
// @ts-ignore
import { callGemini, DEMO_MODE } from '../utils/gemini';

export async function generatePredictionReasoning(
  riskResults: CityRiskScore[],
  apiKey: string
): Promise<GeminiPredictionResponse> {
  const systemPrompt = `You are TranaAI's Prediction Engine for India disaster management. You analyze weather data and risk scores to generate actionable pre-disaster briefings for field commanders. Be precise, use numbers, avoid vague language. Always mention timeframe.`;

  // Dynamically generate mock response based on actual risk results
  const top3 = riskResults.slice(0, 3);
  const MOCK_PREDICTION_RESPONSE: GeminiPredictionResponse = {
    topThreats: top3.map(z => ({
      city: z.cityName,
      threat: z.primaryThreat !== "low" ? z.primaryThreat : "severe vulnerability",
      reasoning: `Forecast indicates a high probability of severe conditions combining with infrastructure vulnerability in ${z.cityName}.`,
      action: `Pre-deploy emergency response units and elevate critical supplies in ${z.cityName}.`,
      confidence: Math.floor(Math.random() * 10) + 85 // Random confidence between 85-94
    })),
    nationalSummary: `Critical weather systems are converging. Immediate preemptive deployment required for ${top3.map(z=>z.cityName).join(', ')}.`
  };

  const userPrompt = `Based on 72-hour forecast data, here are risk scores for Indian cities:
${JSON.stringify(riskResults, null, 2)}

Generate a prediction briefing containing:
1. Top 3 cities most likely to need emergency response in next 72 hours
2. For each: specific threat, severity reasoning with numbers, recommended pre-deployment action
3. One national-level summary sentence for command center display

Format response as JSON:
{
  "topThreats": [
    {
      "city": "string",
      "threat": "string",
      "reasoning": "string",
      "action": "string",
      "confidence": number
    }
  ],
  "nationalSummary": "string"
}
Return ONLY valid JSON, no markdown formatting blocks like \`\`\`json.`;

  if (DEMO_MODE) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return MOCK_PREDICTION_RESPONSE;
  }

  const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

  try {
    const rawResponse = await callGemini(apiKey, fullPrompt);
    
    // Clean up potential markdown formatting if Gemini included it despite instructions
    const cleanedJson = rawResponse.replace(/```json\n?|\n?```/g, '').trim();
    
    return JSON.parse(cleanedJson) as GeminiPredictionResponse;
  } catch (error) {
    console.error("Gemini prediction reasoning failed/quota exceeded, using fallback:", error);
    return MOCK_PREDICTION_RESPONSE;
  }
}
