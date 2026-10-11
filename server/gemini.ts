/**
 * Charlie Creator Hub - Server-side Gemini AI Service
 * Grounded in @google/genai SDK for research, ideation, dual-format scripts, and Veo video operations.
 */

import { GoogleGenAI, GenerateVideosOperation } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;

export const ai = new GoogleGenAI({
  apiKey: apiKey || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export const CHARLIE_SYSTEM_PROMPT = `
You are the dedicated YouTube strategy and production assistant for Charlie Hughes.
Channel: "Charlie Hughes" (@charliehughe5)
Tagline: "Work. Travel. Real Life."
Focus: Solo UK & Ireland travel for work, road trips, motorway services, staying in budget hotels, visiting gyms & leisure facilities, professional life as a national health & safety and fire risk assessor, discussing the working week, and real life.
Location: United Kingdom. Currency: GBP (£). Tone: Conversational, authentic British English, grounded, direct, wry humour, never corporate, never hyperactive fake-hype YouTube clichés.
Confidentiality & Safety: Never invent fake regulations. Distinguish UK legislation (e.g. Regulatory Reform Fire Safety Order 2005, Building Safety Act 2022) from informal guidance. Never recommend filming client passwords, security panels, or restricted plant rooms without explicit client consent.
`;

export async function generateContentSafe(prompt: string, customSystemInstruction?: string): Promise<string> {
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment.');
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: prompt,
    config: {
      systemInstruction: (customSystemInstruction || CHARLIE_SYSTEM_PROMPT).trim(),
      temperature: 0.7,
    },
  });

  return response.text || '';
}

export async function generateJsonSafe<T>(prompt: string, customSystemInstruction?: string): Promise<T> {
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment.');
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: `${prompt}\n\nIMPORTANT: Respond with pure, valid JSON only. Do not wrap in markdown code blocks.`,
    config: {
      systemInstruction: (customSystemInstruction || CHARLIE_SYSTEM_PROMPT).trim(),
      responseMimeType: 'application/json',
      temperature: 0.6,
    },
  });

  const text = (response.text || '{}').trim();
  try {
    return JSON.parse(text) as T;
  } catch (err) {
    // If wrapped in ```json ... ``` fallback clean-up
    const cleaned = text.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
    return JSON.parse(cleaned) as T;
  }
}

// Veo Video Operations
export async function startVeoGeneration(prompt: string, aspectRatio: '16:9' | '9:16' = '16:9') {
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment.');
  }

  const model = process.env.VEO_MODEL_NAME || 'veo-3.1-lite-generate-preview';
  const operation = await ai.models.generateVideos({
    model,
    prompt: `Professional video bumper for British creator Charlie Hughes (Work. Travel. Real Life.): ${prompt}`,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio,
    },
  });

  return {
    operationName: operation.name,
    model,
  };
}

export async function checkVeoStatus(operationName: string) {
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment.');
  }

  const op = new GenerateVideosOperation();
  op.name = operationName;
  const updated = await ai.operations.getVideosOperation({ operation: op });

  return {
    done: updated.done,
    response: updated.response,
    error: updated.error,
  };
}
