import { GoogleGenAI, Modality } from "@google/genai";
import type { GenerateContentResponse } from "@google/genai";
import { ALL_VOICES } from "../constants";
import type { VoiceOption } from "../types";

let ai: GoogleGenAI | null = null;

const getAiClient = () => {
    if (!ai) {
        if (!process.env.API_KEY) {
            throw new Error("API_KEY environment variable not set");
        }
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return ai;
}

export const generateSpeech = async (prompt: string, voiceName: string): Promise<string | null> => {
    try {
        const client = getAiClient();
        const response: GenerateContentResponse = await client.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: voiceName },
                    },
                },
            },
        });
        
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return base64Audio || null;
    } catch (error) {
        console.error("Error generating speech:", error);
        throw new Error("Failed to generate audio from the API. Please check your API key and network connection.");
    }
};

export const listVoices = async (): Promise<VoiceOption[]> => {
    // In a real application, this would fetch from an API endpoint.
    // Here, we simulate it by returning the hardcoded list asynchronously.
    return Promise.resolve(ALL_VOICES);
};
