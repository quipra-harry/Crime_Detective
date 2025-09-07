import React from 'react';
import { DetectiveIcon } from './icons/DetectiveIcon';

interface WelcomeMessageProps {
  onDismiss: () => void;
}

const WelcomeMessage: React.FC<WelcomeMessageProps> = ({ onDismiss }) => {
  return (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" aria-modal="true" role="dialog">
      <div className="bg-white/95 p-8 rounded-2xl shadow-2xl text-center max-w-2xl transform animate-slide-up opacity-0" style={{ animationFillMode: 'forwards' }}>
        <div className="flex justify-center items-center mb-4">
          <DetectiveIcon className="w-12 h-12 text-blue-600 mr-4" />
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">Welcome to CriminalVision AI</h1>
        </div>
        <p className="text-lg text-gray-600 leading-relaxed mt-4">
          This is your digital police sketch artist. By simply describing a suspect, our advanced AI will generate a photorealistic portrait in real-time.
        </p>
        <p className="text-lg text-gray-600 leading-relaxed mt-2">
          You can then refine the image through natural conversation, just like talking to a real detective, until the sketch perfectly matches the witness's memory.
        </p>
        <button
          onClick={onDismiss}
          className="mt-8 px-8 py-3 bg-blue-600 text-white font-bold text-lg rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default WelcomeMessage;