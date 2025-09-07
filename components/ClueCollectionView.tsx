import React, { useState, useEffect } from 'react';
import type { Case } from '../types';
import { getCases } from '../services/caseService';
import CaseDetailView from './CaseDetailView';
import { ClueIcon } from './icons/ClueIcon';

const ClueCollectionView: React.FC = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);

  useEffect(() => {
    // Load cases on initial render and when returning from detail view
    if (!selectedCase) {
      setCases(getCases());
    }
  }, [selectedCase]);

  if (selectedCase) {
    return <CaseDetailView caseData={selectedCase} onBack={() => setSelectedCase(null)} />;
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-2xl max-w-5xl mx-auto animate-fade-in">
      <header className="flex items-center space-x-3 text-gray-500 mb-6">
        <ClueIcon className="w-6 h-6" />
        <h1 className="text-xl font-bold">Clue Collection</h1>
      </header>

      {cases.length === 0 ? (
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold text-gray-700">No Cases Saved</h2>
          <p className="text-gray-500 mt-2">
            Go to the "Live Interrogation" tab to start a new session.
            <br />
            Completed cases will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cases.map((caseItem) => (
            <button
              key={caseItem.id}
              onClick={() => setSelectedCase(caseItem)}
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 text-left p-4 group flex flex-col"
            >
              <div className="flex-grow">
                <div className="w-full aspect-square bg-gray-200 rounded-md overflow-hidden mb-4">
                    <img src={`data:image/jpeg;base64,${caseItem.images[0]}`} alt={caseItem.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <h2 className="font-bold text-lg text-gray-800">{caseItem.title}</h2>
                <p className="text-sm text-gray-500 line-clamp-2 mt-1">{caseItem.description}</p>
              </div>
              <p className="text-xs text-gray-400 mt-3 self-start">{new Date(caseItem.createdAt).toLocaleDateString()}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClueCollectionView;
