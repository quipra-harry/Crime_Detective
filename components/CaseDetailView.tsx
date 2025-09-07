import React from 'react';
import type { Case } from '../types';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { ShareIcon } from './icons/ShareIcon';
import { MoreIcon } from './icons/MoreIcon';

interface CaseDetailViewProps {
  caseData: Case;
  onBack: () => void;
}

const CaseDetailView: React.FC<CaseDetailViewProps> = ({ caseData, onBack }) => {
  return (
    <div className="bg-gray-100/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-2xl max-w-7xl mx-auto animate-fade-in">
      <header className="flex items-center justify-between pb-4 border-b border-gray-300">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200 transition-colors" aria-label="Back to cases">
            <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">{caseData.title}</h1>
            <p className="text-sm text-gray-500">Transcription & Media</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full hover:bg-gray-200 transition-colors" aria-label="Share case">
            <ShareIcon className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-200 transition-colors" aria-label="More options">
            <MoreIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4 h-[calc(100vh-180px)]">
        {/* Chat/Transcript Column */}
        <div className="lg:col-span-2 bg-white/50 p-4 rounded-lg shadow-inner overflow-y-auto">
          <div className="space-y-6">
            {caseData.conversation.map((msg, index) => (
              <div key={index} className={`flex items-start gap-3 ${msg.speaker === 'Witness' ? '' : 'flex-row-reverse'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${msg.speaker === 'Witness' ? 'bg-blue-200 text-blue-800' : 'bg-indigo-200 text-indigo-800'}`}>
                  {msg.speaker === 'Witness' ? 'W' : 'AI'}
                </div>
                <div className="flex-1">
                    <p className="font-semibold text-gray-700 mb-1">{msg.speaker === 'Witness' ? 'Witness' : 'Detective AI'}</p>
                    <div className={`p-3 rounded-lg ${msg.speaker === 'Witness' ? 'bg-gray-200' : 'bg-blue-100'}`}>
                        <p className="text-gray-800">{msg.text}</p>
                    </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Visual Clues Column */}
        <div className="bg-white/50 p-4 rounded-lg shadow-inner overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-gray-800">Visual Clues</h2>
            <span className="text-sm text-gray-500">{caseData.images.length} Item(s)</span>
          </div>
          <div className="space-y-4">
            {caseData.images.map((imgSrc, index) => (
              <div key={index} className="rounded-lg overflow-hidden shadow">
                <img 
                  src={`data:image/jpeg;base64,${imgSrc}`} 
                  alt={`Visual Clue ${index + 1}`}
                  className="w-full h-auto object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseDetailView;
