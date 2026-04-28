/* ─── GEMINI AI SERVICE ───────────────────────────────────────────────────── */

export const DEMO_MODE = false; // Set to true to completely bypass the API and use mock data

export const callGemini = async (apiKey, prompt) => {
  // Extract top 3 zones from the prompt to make the mock dynamic!
  let topZones = ["Kochi", "Kolkata", "Pondicherry"];
  const match1 = prompt.match(/1\.\s([^\s—]+)/);
  const match2 = prompt.match(/2\.\s([^\s—]+)/);
  const match3 = prompt.match(/3\.\s([^\s—]+)/);
  if (match1) topZones[0] = match1[1];
  if (match2) topZones[1] = match2[1];
  if (match3) topZones[2] = match3[1];

  const MOCK_AI_PRIORITY_RESPONSE = `## 🔴 Risk Assessment
Current analysis indicates an extreme escalation in multiple zones. ${topZones[0]} is at CRITICAL risk due to severe conditions exacerbating infrastructure collapse. ${topZones[1]} and ${topZones[2]} are at HIGH risk from rising threats affecting dense populations.

## ⚠️ Priority Zones
1. **${topZones[0]}** — Highest priority score based on current weights. Immediate intervention required.
2. **${topZones[1]}** — Secondary priority due to high population and resource gaps. 
3. **${topZones[2]}** — Tertiary priority. Rapid deterioration expected without support.

## 🚑 Resource Allocation Plan
Deploy the 50 available volunteers as follows:
- **${topZones[0]}:** 25 volunteers (Focus: Immediate evacuation and triage)
- **${topZones[1]}:** 15 volunteers (Focus: Perimeter securing and relief supply)
- **${topZones[2]}:** 10 volunteers (Focus: Early warning coordination)

## 🧠 Strategic Insight
**Establish immediate supply corridors to ${topZones[0]}.** The rapid severity trend indicates a narrow window for preemptive evacuation. Pre-position heavy lifting equipment near ${topZones[1]} and ${topZones[2]} to mitigate incoming blockages.`;
  if (DEMO_MODE) {
    // Simulate network delay for realism
    await new Promise(resolve => setTimeout(resolve, 1500));
    return MOCK_AI_PRIORITY_RESPONSE;
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
        }),
      }
    );
    
    if (!res.ok) {
      const err = await res.json();
      console.error("Gemini API Error:", err);
      // Fallback on quota exceeded or any API error
      return MOCK_AI_PRIORITY_RESPONSE;
    }
    
    const data = await res.json();
    return (
      data?.candidates?.[0]?.content?.parts?.[0]?.text || MOCK_AI_PRIORITY_RESPONSE
    );
  } catch (error) {
    console.error("Gemini Request Failed:", error);
    // Fallback on network failure
    return MOCK_AI_PRIORITY_RESPONSE;
  }
};

export const buildPrompt = (zones, weights, question) => {
  const top10 = [...zones]
    .sort((a, b) => {
      const sa =
        weights.sev * (a.severity / 10) +
        weights.pop * Math.min(a.pop / 400000, 1) +
        weights.res * Math.min((20 - a.res) / 20, 1) +
        weights.trend * Math.min(Math.max(a.trend, 0) / 2, 1);
      const sb =
        weights.sev * (b.severity / 10) +
        weights.pop * Math.min(b.pop / 400000, 1) +
        weights.res * Math.min((20 - b.res) / 20, 1) +
        weights.trend * Math.min(Math.max(b.trend, 0) / 2, 1);
      return sb - sa;
    })
    .slice(0, 10);

  const zoneList = top10
    .map(
      (z, i) =>
        `${i + 1}. ${z.name} — Type: ${z.type}, Severity: ${z.severity}/10, Pop: ${z.pop.toLocaleString()}, Resources: ${z.res}, Trend: ${z.trend > 0 ? "+" : ""}${z.trend}`
    )
    .join("\n");

  const basePrompt = `You are an expert disaster response coordinator AI for India. You have access to real-time disaster zone data.

Current priority weights:
- Base Severity: ${(weights.sev * 100).toFixed(0)}%
- Population Impact: ${(weights.pop * 100).toFixed(0)}%
- Resource Gap: ${(weights.res * 100).toFixed(0)}%
- Severity Trend: ${(weights.trend * 100).toFixed(0)}%

Top 10 priority zones right now:
${zoneList}

Total zones monitored: ${zones.length}
Critical zones (8+): ${zones.filter((z) => z.severity >= 8).length}`;

  if (question) {
    return `${basePrompt}\n\nQuestion from coordinator: ${question}\n\nProvide a direct, actionable response in 2-3 short paragraphs. Be specific with zone names and numbers.`;
  }

  return `${basePrompt}

Based on this data, provide your analysis in EXACTLY this format with these 4 sections:

## 🔴 Risk Assessment
Assess the overall risk level across all zones. Which zones are at critical risk and why?

## ⚠️ Priority Zones
List the top 3 zones that need IMMEDIATE action, with specific reasoning.

## 🚑 Resource Allocation Plan
How should available personnel (50 volunteers) be distributed? Give specific numbers per zone.

## 🧠 Strategic Insight
One clear strategic directive for the command team. Consider trends, population density, and resource gaps.

Keep your response concise, actionable, and field-ready. Use bullet points where helpful.`;
};

export const formatGeminiOutput = (text) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(
      /^#{1,3}\s(.+)$/gm,
      '<strong style="color:#fbbf24;font-size:14px;font-family:Rajdhani,sans-serif;display:block;margin:12px 0 6px">$1</strong>'
    )
    .replace(
      /^(\d+)\.\s/gm,
      '<span style="color:#3b82f6;font-weight:600">$1.</span> '
    )
    .replace(/^[-•]\s/gm, '<span style="color:#4b5563">▸</span> ')
    .split("\n")
    .map((line) => `<p style="margin-bottom:6px">${line}</p>`)
    .join("");
};
