import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { generateImage, editImage, streamNextQuestion } from '../services/geminiService';
import { saveCase } from '../services/caseService';
import type { ChatMessage, Case } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { DetectiveIcon } from './icons/DetectiveIcon';
import VoiceVisualizer from './VoiceVisualizer';
import GenerativeAnimation from './GenerativeAnimation';

const LiveInterrogationView: React.FC = () => {
  const [aiPrompt, setAiPrompt] = useState("Okay, I'm listening. Describe the suspect...");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState('image/jpeg');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>([]);

  const isLoadingRef = useRef(isLoading);
  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);
  
  const handleSpeechResult = useCallback(async (transcript: string) => {
    if (isLoadingRef.current || !transcript) return;
    
    setError(null);
    setIsLoading(true);
    
    const userMessage: ChatMessage = { speaker: 'Witness', text: transcript };
    const newHistory = [...conversationHistory, userMessage];
    setConversationHistory(newHistory);

    try {
      if (!generatedImage) {
        // First generation
        const base64Image = await generateImage(transcript);
        setGeneratedImage(base64Image);
        setImageMimeType('image/jpeg');
        
        // Stream the follow-up question
        setAiPrompt('');
        const conversationText = newHistory.map(m => `${m.speaker}: ${m.text}`).join('\n');
        const stream = await streamNextQuestion(conversationText);
        let fullResponse = '';
        for await (const chunk of stream) {
            const chunkText = chunk.text;
            fullResponse += chunkText;
            setAiPrompt(prev => prev + chunkText);
        }
        setConversationHistory(prev => [...prev, { speaker: 'AI', text: fullResponse }]);

      } else {
        // Refinement
        const { image: newImage, text: newAiText, mimeType: newMimeType } = await editImage(generatedImage, imageMimeType, transcript);
        if (newImage && newMimeType) {
            setGeneratedImage(newImage);
            setImageMimeType(newMimeType);
        }
        setAiPrompt(newAiText); 
        setConversationHistory(prev => [...prev, { speaker: 'AI', text: newAiText }]);
      }

    } catch (err) {
      console.error(err);
      setError('An error occurred. Please try again.');
      setAiPrompt("I'm sorry, I couldn't process that. Could you repeat?");
    } finally {
      setIsLoading(false);
    }
  }, [generatedImage, imageMimeType, conversationHistory]);

  const { isListening, isAvailable, toggleListening, audioStream } = useSpeechRecognition(handleSpeechResult);

  const resetSession = () => {
      if (isListening) {
        toggleListening();
      }

      // Save the case before resetting
      if (generatedImage && conversationHistory.length > 0) {
        const firstWitnessMessage = conversationHistory.find(m => m.speaker === 'Witness');
        const newCase: Case = {
          id: `case-${Date.now()}`,
          title: `Case #${Date.now().toString().slice(-5)}`,
          description: firstWitnessMessage ? firstWitnessMessage.text : "No initial description.",
          images: [generatedImage],
          conversation: conversationHistory,
          createdAt: Date.now(),
        };
        saveCase(newCase);
      }

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
              onClick={toggleListening}
              disabled={isLoading || !isAvailable}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300/50
                ${isListening ? 'bg-transparent' : 'bg-blue-600 hover:bg-blue-700'} 
                ${isLoading || !isAvailable ? 'bg-gray-400 cursor-not-allowed' : ''}`}
              aria-label={isListening ? "Stop listening" : "Start listening"}
            >
              {isListening && audioStream ? (
                <VoiceVisualizer audioStream={audioStream} />
              ) : (
                <MicrophoneIcon className="w-10 h-10 text-white" />
              )}
            </button>
            <div>
                {isLoading ? (
                    <span className="text-lg text-gray-600">Generating...</span>
                ) : isListening ? (
                    <span className="text-lg text-gray-600">Listening... Click to stop.</span>
                ) : (
                    <span className="text-lg text-gray-500">Click to speak</span>
                )}
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center bg-gray-100 rounded-lg aspect-square overflow-hidden">
            {isLoading && !generatedImage && (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 bg-gray-900/5">
                    <div className="w-full h-full">
                      <GenerativeAnimation />
                    </div>
                    <p className="absolute bottom-4 text-gray-600/80">Composing the portrait...</p>
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