import { GoogleGenAI } from "@google/genai";

const llmConfig = {
  apiKey: import.meta.env.VITE_GEMINI_API_KEY || "your-api-key"
}

const ai = new GoogleGenAI(llmConfig);

export async function summarizeText(text) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Summarize my journal entry in 2-3 sentences. Focus on the main themes, emotions, and key events: ${text} and give me a very nice flow. Thanks`
  });
  console.log(response);

  return response.text;
}

export async function weeklyInsights(texts) {
  const allNotes = texts.join("\n---\n");
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Analyze the my entries from the past 7 days: 

${allNotes}

Provide motivational weekly insights that include:
1. Main emotional themes and patterns
2. Positive trends and achievements
3. Areas of growth or challenges
4. Encouraging words for the week ahead

Keep it warm, supportive, and concise (150-200 words). Thanks`
  });
  return response.text;
}

export async function monthlyInsights(texts) {
  const allNotes = texts.join("\n---\n");
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Analyze the my entries from the past 30 days:

${allNotes}

Provide comprehensive monthly insights that include:
1. Overall emotional journey and major patterns
2. Significant achievements and milestones
3. Recurring themes or concerns
4. Personal growth observations
5. Motivational message for the month ahead

Keep it reflective, supportive, and insightful (200-250 words). Thanks`
  });

  return response.text;
}