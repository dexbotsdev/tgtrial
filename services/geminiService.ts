import { GoogleGenAI, Type } from "@google/genai";
import { TokenAnalysis } from '../types';

// FIX: Removed unnecessary 'as string' cast for API key to align with guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    projectName: {
      type: Type.STRING,
      description: "A creative, fictional project name for this token."
    },
    useCase: {
      type: Type.STRING,
      description: "A brief, plausible but fictional use case for this token."
    },
    riskAssessment: {
      type: Type.STRING,
      description: "The estimated risk level. Must be one of: 'Low', 'Medium', 'High', 'Very High'."
    }
  },
  required: ["projectName", "useCase", "riskAssessment"]
};

export const analyzeTokenContract = async (contractAddress: string): Promise<TokenAnalysis> => {
  try {
    const prompt = `You are a crypto token analyst. A new BSC token has been launched with the contract address ${contractAddress}. 
    Based on this address alone, generate a fictional, brief analysis of its potential. 
    Include a risk assessment, a potential use case, and a creative project name.
    Your response must conform to the provided JSON schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
      },
    });

    const jsonText = response.text.trim();
    // Validate that we have a valid JSON string
    if (!jsonText.startsWith('{') || !jsonText.endsWith('}')) {
        throw new Error('Invalid JSON format received from API');
    }
    const analysisResult = JSON.parse(jsonText);
    
    // Simple validation
    if (!analysisResult.projectName || !analysisResult.useCase || !analysisResult.riskAssessment) {
        throw new Error('Incomplete analysis data received');
    }

    return analysisResult as TokenAnalysis;

  } catch (error) {
    console.error("Error analyzing token contract:", error);
    // Return a default error object that matches the type
    return {
        projectName: "Analysis Failed",
        useCase: "Could not retrieve AI analysis for this token.",
        riskAssessment: "High"
    };
  }
};
