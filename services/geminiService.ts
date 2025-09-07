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

export const editImage = async (base64ImageData: string, mimeType: string, newInstruction: string): Promise<{ image: string, text: string }> => {
    const prompt = `Refine the suspect's portrait based on this new information: "${newInstruction}". Keep the character consistent but apply the requested changes accurately. Respond with a brief confirmation and a follow-up question to get more detail.`;
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
    let textResponse: string = "I've updated the image. What else do you remember?";
    
    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            newImage = part.inlineData.data;
        } else if (part.text) {
            textResponse = part.text;
        }
    }

    if(newImage) {
        return { image: newImage, text: textResponse };
    }

    throw new Error("Image editing failed.");
};

export const streamNextQuestion = async (conversation: string) => {
    const prompt = `You are a calm, experienced police detective interrogating a witness to create a suspect sketch. Your goal is to ask clarifying questions to get more visual details. The conversation so far is: "${conversation}". Ask one, and only one, follow-up question to get more specific information about the suspect's face or distinct features. Keep your question concise and direct.`;
    
    return ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
};