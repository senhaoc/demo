import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, Diagnosis } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

/**
 * Analyzes an X-ray image using Gemini 2.5 Flash to simulate the CLIP+BLIP pipeline
 * described in the PDF (Classification + Reporting).
 */
export const analyzeXray = async (base64Image: string, mimeType: string): Promise<AnalysisResult> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please set REACT_APP_GEMINI_API_KEY.");
  }

  const modelId = "gemini-2.5-flash"; // Efficient for multimodal analysis
  
  const prompt = `
    You are an expert radiologist AI system (MedVLM). 
    Analyze this chest X-ray image.
    1. Classify it strictly as either 'NORMAL' or 'PNEUMONIA'.
    2. Provide a confidence score between 0.0 and 1.0 based on visual evidence of opacities, consolidation, or clear lungs.
    3. Write a concise medical report in the style of a radiologist (DICOM style), mentioning lungs, ribs, clavicles, and heart.
    4. Briefly describe where the pathology is located if present (Explainability).
  `;

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      diagnosis: { type: Type.STRING, enum: ["NORMAL", "PNEUMONIA"] },
      confidence: { type: Type.NUMBER, description: "A number between 0 and 1" },
      report: { type: Type.STRING, description: "Medical report text" },
      heatmapExplanation: { type: Type.STRING, description: "Description of the region of interest" },
    },
    required: ["diagnosis", "confidence", "report"],
  };

  const startTime = performance.now();

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          { inlineData: { mimeType, data: base64Image } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.2, // Low temperature for consistent medical diagnosis
      }
    });

    const endTime = performance.now();
    const resultText = response.text;
    
    if (!resultText) throw new Error("No response from AI");

    const parsed = JSON.parse(resultText);

    return {
      diagnosis: parsed.diagnosis as Diagnosis,
      confidence: parsed.confidence,
      report: parsed.report,
      heatmapExplanation: parsed.heatmapExplanation,
      latency: Math.round(endTime - startTime)
    };
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Fallback for demo purposes if API fails
    return {
      diagnosis: Diagnosis.NORMAL,
      confidence: 0,
      report: "Error analyzing image. Please check API Key.",
      latency: 0
    };
  }
};

/**
 * Generates a synthetic X-ray using Gemini/Imagen logic to replicate Stable Diffusion.
 */
export const generateSyntheticXray = async (prompt: string): Promise<string> => {
   if (!apiKey) {
    throw new Error("API Key is missing.");
  }
  
  // Using gemini-2.5-flash-image for generation as per guidelines for general generation
  const modelId = "gemini-2.5-flash-image"; 
  
  // Enforce medical style prompts internally to match PDF's "Expert Prompt" logic
  const refinedPrompt = `Medical chest x-ray, radiograph, dicom style, high quality, ${prompt}`;
  
  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [{ text: refinedPrompt }]
      },
      config: {
        imageConfig: {
            aspectRatio: "1:1",
        }
      }
    });

    // Extract image from response
    // The guidelines say output response contains both image and text parts.
    if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
    }
    
    throw new Error("No image generated");

  } catch (error) {
    console.error("Generation Error:", error);
    return ""; // Return empty string on failure
  }
};
