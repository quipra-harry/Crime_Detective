import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateImage = async (description: string): Promise<string> => {
    const prompt = `A photorealistic, high-resolution portrait of a suspect for a police sketch. The description is: "${description}". The image should be a clear, front-facing mugshot-style photo with a neutral background. Focus on generating a realistic human face based on the details provided.`;
    
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '1:1',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        return response.generatedImages[0].image.imageBytes;
    }

    throw new Error("Image generation failed.");
};

export const editImage = async (base64ImageData: string, mimeType: string, newInstruction: string): Promise<{ image: string | null, text: string, mimeType: string | null }> => {
    const prompt = `You are a police sketch artist AI. Refine the portrait with this detail: "${newInstruction}". Ask one short, clarifying question for the next facial detail. Frame it as a natural, single-sentence question. Be concise but not abrupt.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64ImageData,
                mimeType: mimeType,
              },
            },
            {
              text: prompt,
            },
          ],
        },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
      });

    let newImage: string | null = null;
    let newMimeType: string | null = null;
    let textResponse: string = "I've updated the image. What else do you remember?";
    
    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
        for (const part of candidate.content.parts) {
            if (part.inlineData) {
                newImage = part.inlineData.data;
                newMimeType = part.inlineData.mimeType;
            } else if (part.text) {
                textResponse = part.text;
            }
        }
    }

    return { image: newImage, text: textResponse, mimeType: newMimeType };
};

export const streamNextQuestion = async (conversation: string) => {
    const prompt = `As a police sketch artist AI, ask one short, clarifying question for a new facial detail based on the witness statement: "${conversation}". Frame it as a natural, single-sentence question. Be concise but not abrupt.`;
    
    return ai.models.generateContentStream({
        model: 'gemini-2.5-flash-lite',
        contents: prompt,
    });
};