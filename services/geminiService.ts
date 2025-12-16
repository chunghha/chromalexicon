import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.GENMINI_API_KEY || "";
  if (!apiKey) {
    console.warn("GENMINI_API_KEY not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

export const getColorEtymology = async (colorName: string): Promise<string> => {
  const ai = getAiClient();

  const prompt = `
    You are an expert linguistics curator for a museum of color.
    Explain the etymology, historical origin, and a fun fact about the color "${colorName}".
    Keep the tone academic yet accessible, similar to a museum plaque.
    Keep it under 100 words.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text || "Could not retrieve color history at this time.";
  } catch (error) {
    console.error("Error fetching color etymology:", error);
    return "The curator is currently unavailable. Please check your API key.";
  }
};

export const getPigmentVisualization = async (
  pigmentName: string,
  description: string,
): Promise<string | null> => {
  const ai = getAiClient();
  const prompt = `Generate a high-quality, scientific illustration or museum specimen photo of the physical source/material for the pigment "${pigmentName}". Context: ${description}. Isolated on a neutral or white background.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [{ text: prompt }],
      },
    });

    for (const candidate of response.candidates || []) {
      for (const part of candidate.content?.parts || []) {
        if (part.inlineData && part.inlineData.data) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating pigment image:", error);
    return null;
  }
};

export const getPigment3DModel = async (
  pigmentName: string,
  description: string,
  textureType: "raw" | "polished" = "raw",
): Promise<string | null> => {
  const ai = getAiClient();

  const objectDescription =
    textureType === "raw"
      ? `raw, unrefined natural material source for the pigment "${pigmentName}" (${description}). Rough texture, organic shape, rugged, unpolished state`
      : `processed, refined pigment powder or finished artifact made from "${pigmentName}". Smooth texture, purified color state, perhaps in a glass jar, mound of powder, or as a shaped pigment block. Clean and polished`;

  const prompt = `Generate a photorealistic 3D render of the ${objectDescription}. The object should be centered, floating in a void, with dramatic studio lighting. It should look like a high-end 3D asset preview, isolated on a dark background. Isometric view.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [{ text: prompt }],
      },
    });

    for (const candidate of response.candidates || []) {
      for (const part of candidate.content?.parts || []) {
        if (part.inlineData && part.inlineData.data) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating 3D model view:", error);
    return null;
  }
};

export const generateCulturalImage = async (
  meaning: string,
  color: string,
  culture: string,
): Promise<string | null> => {
  const ai = getAiClient();
  const prompt = `Create an artistic, symbolic illustration representing the concept of "${meaning}" associated with the color "${color}" in ${culture} culture. The style should be evocative and artistic, suitable for a cultural exhibition.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [{ text: prompt }],
      },
    });

    for (const candidate of response.candidates || []) {
      for (const part of candidate.content?.parts || []) {
        if (part.inlineData && part.inlineData.data) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating cultural image:", error);
    return null;
  }
};

export const getIsccVisualization = async (
  colorName: string,
  hex: string,
): Promise<string | null> => {
  const ai = getAiClient();
  const prompt = `Create a photorealistic, macro photography shot of a textured material sample representing the standard color "${colorName}" (Hex code: ${hex}). The texture should look like high-quality pigment powder, thick oil paint, or a fabric swatch. Isolated on a neutral background. Focus on the purity of the color.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [{ text: prompt }],
      },
    });

    for (const candidate of response.candidates || []) {
      for (const part of candidate.content?.parts || []) {
        if (part.inlineData && part.inlineData.data) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating ISCC image:", error);
    return null;
  }
};

export const getIscc3DModel = async (
  colorName: string,
  hex: string,
  shape: "sphere" | "cube" = "sphere",
): Promise<string | null> => {
  const ai = getAiClient();
  const shapeDesc =
    shape === "sphere"
      ? "perfectly smooth, glossy sphere"
      : "textured, matte cube";
  const prompt = `Generate a photorealistic 3D render of a ${shapeDesc} made of a material in the exact color "${colorName}" (Hex code: ${hex}). Dramatic studio lighting, floating in a void, isolated on a dark background. High-end product visualization style.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [{ text: prompt }],
      },
    });

    for (const candidate of response.candidates || []) {
      for (const part of candidate.content?.parts || []) {
        if (part.inlineData && part.inlineData.data) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating ISCC 3D model:", error);
    return null;
  }
};
