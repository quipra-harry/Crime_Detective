
import React, { useState, useCallback } from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { generateImage, editImage, streamNextQuestion } from '../services/geminiService';
import { CloseIcon } from './icons/CloseIcon';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { DetectiveIcon } from './icons/DetectiveIcon';

const LiveInterrogationView: React.FC = () => {
  const [aiPrompt, setAiPrompt] = useState("Okay, I'm listening. Describe the suspect...");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState('image/jpeg');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationHistory, setConversationHistory] = useState<string[]>([]);
  
  const handleSpeechResult = useCallback(async (transcript: string) => {
    setError(null);
    setIsLoading(true);
    const newHistory = [...conversationHistory, `Witness: ${transcript}`];
    setConversationHistory(newHistory);

    try {
      if (!generatedImage) {
        // First generation
        const base64Image = await generateImage(transcript);
        setGeneratedImage(base64Image);
        setImageMimeType('image/jpeg');
        
        // Stream the follow-up question
        setAiPrompt('');
        const stream = await streamNextQuestion(newHistory.join('\n'));
        let fullResponse = '';
        for await (const chunk of stream) {
            const chunkText = chunk.text;
            fullResponse += chunkText;
            setAiPrompt(prev => prev + chunkText);
        }
        setConversationHistory(prev => [...prev, `AI: ${fullResponse}`]);

      } else {
        // Refinement - The image editing model is conversational
        const { image: newImage, text: newAiText } = await editImage(generatedImage, imageMimeType, transcript);
        setGeneratedImage(newImage);
        setImageMimeType('image/png'); 
        setAiPrompt(newAiText); // Use AI's conversational response directly
        setConversationHistory(prev => [...prev, `AI: ${newAiText}`]);
      }

    } catch (err) {
      console.error(err);
      setError('An error occurred. Please try again.');
      setAiPrompt("I'm sorry, I couldn't process that. Could you repeat?");
    } finally {
      setIsLoading(false);
    }
  }, [generatedImage, imageMimeType, conversationHistory]);

  const { isListening, isAvailable, startListening } = useSpeechRecognition(handleSpeechResult);

  const resetSession = () => {
      setAiPrompt("Okay, I'm listening. Describe the suspect...");
      setGeneratedImage(null);
      setIsLoading(false);
      setError(null);
      setConversationHistory([]);
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-2xl max-w-4xl mx-auto">
      <header className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3 text-gray-500">
          <DetectiveIcon className="w-6 h-6" />
          <h1 className="text-xl font-bold">CriminalVision AI</h1>
        </div>
        <button onClick={resetSession} className="w-9 h-9 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-full transition-colors">
          <CloseIcon className="w-5 h-5 text-gray-600" />
        </button>
      </header>

      {!isAvailable && <p className="text-red-500 text-center">Speech recognition is not available in your browser.</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col justify-between">
          <div>
            <p className="text-3xl sm:text-4xl font-light leading-tight">"{aiPrompt}"</p>
          </div>
          <div className="flex items-center space-x-4 mt-8">
            <button
              onClick={startListening}
              disabled={isListening || isLoading || !isAvailable}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out transform hover:scale-105
                ${isListening ? 'bg-red-500 animate-pulse' : 'bg-blue-600'} 
                ${isLoading || !isAvailable ? 'bg-gray-400 cursor-not-allowed' : 'hover:bg-blue-700'}`}
            >
              <MicrophoneIcon className="w-10 h-10 text-white" />
            </button>
            <div>
                {isLoading ? (
                    <span className="text-lg text-gray-600">Generating...</span>
                ) : isListening ? (
                    <span className="text-lg text-gray-600">Listening...</span>
                ) : (
                    <span className="text-lg text-gray-500">Press to speak</span>
                )}
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center bg-gray-100 rounded-lg aspect-square">
            {isLoading && !generatedImage && (
                <div className="flex flex-col items-center text-gray-500">
                    <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-3">Generating initial sketch...</p>
                </div>
            )}
            {generatedImage && (
                <img
                    src={`data:${imageMimeType};base64,${generatedImage}`}
                    alt="Generated Suspect"
                    className={`w-full h-full object-cover rounded-lg transition-opacity duration-500 ${isLoading ? 'opacity-50' : 'opacity-100'}`}
                />
            )}
            {!isLoading && !generatedImage && (
                <div className="text-center text-gray-400 p-4">
                    <p>The suspect's portrait will appear here.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default LiveInterrogationView;
