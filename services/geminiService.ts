
import { GoogleGenAI, Type } from "@google/genai";
import { CBCData, AnalysisResult, AnemiaSeverity } from "../types";

export const getAIExplanation = async (data: CBCData, analysis: AnalysisResult): Promise<{ guidance: string, diet: any[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Determine the intensity of the plan based on severity
  let severityInstruction = "";
  if (analysis.severity === AnemiaSeverity.SEVERE) {
    severityInstruction = `
      - The patient has SEVERE anemia (Hb: ${data.hemoglobin}). 
      - The diet plan MUST be high-potency, focusing on maximum iron bioavailability (heme-iron), vitamin C for absorption, and immediate nutritional support.
      - Emphasize medical consultation as the top priority alongside the diet.`;
  } else if (analysis.severity === AnemiaSeverity.MODERATE) {
    severityInstruction = `
      - The patient has MODERATE anemia (Hb: ${data.hemoglobin}).
      - Focus on a consistent, iron-dense therapeutic diet to raise hemoglobin levels steadily over the next 30-60 days.`;
  } else if (analysis.severity === AnemiaSeverity.MILD) {
    severityInstruction = `
      - The patient has MILD anemia (Hb: ${data.hemoglobin}).
      - Provide a supportive, balanced diet to correct minor deficiencies and prevent further drops.`;
  } else {
    severityInstruction = `
      - The patient is HEALTHY (Hb: ${data.hemoglobin}).
      - DO NOT provide a recovery diet. 
      - Provide a "Wellness & Maintenance" plan focusing on long-term vitality.`;
  }

  const prompt = `
    Context: Clinical hematology report analysis.
    Patient: ${data.age}y ${data.gender}, Hb: ${data.hemoglobin} g/dL, RBC: ${data.rbcCount}, MCV: ${data.mcv}, Morph: ${analysis.type}.
    
    Status: ${severityInstruction}

    Task:
    1. guidance: Provide a 2-3 sentence clinical summary explaining why their specific CBC markers lead to this result.
    2. diet: Provide 4 meals (Breakfast, Lunch, Dinner, Snack/Tip).
    
    CRITICAL: Output ONLY raw JSON. No markdown blocks, no prefix text.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        temperature: 0.2,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            guidance: { type: Type.STRING },
            diet: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  meal: { type: Type.STRING },
                  suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["meal", "suggestions"]
              }
            }
          },
          required: ["guidance", "diet"]
        }
      }
    });

    // Handle potential markdown wrapping in the response text
    let cleanJson = response.text.trim();
    if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson.replace(/^```json\n?/, "").replace(/\n?```$/, "");
    }

    const result = JSON.parse(cleanJson);
    return result;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return { 
      guidance: "AI Analysis is temporarily unavailable. Based on standard clinical guidelines for " + analysis.severity.toLowerCase() + " anemia, you should focus on iron-rich foods and consult a physician.", 
      diet: [
        { meal: "Nutrition Tip", suggestions: ["Increase intake of red meats, legumes, and dark leafy greens.", "Pair iron-rich foods with Vitamin C for better absorption."] },
        { meal: "Breakfast Idea", suggestions: ["Iron-fortified oatmeal with strawberries."] },
        { meal: "Lunch Idea", suggestions: ["Lentil soup with a squeeze of lemon."] },
        { meal: "Dinner Idea", suggestions: ["Grilled spinach and chicken breast."] }
      ] 
    };
  }
};
