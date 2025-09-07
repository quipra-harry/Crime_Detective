import React, { useState, useEffect } from 'react';
import LiveInterrogationView from './components/LiveInterrogationView';
import ClueCollectionView from './components/ClueCollectionView';
import { ClueIcon } from './components/icons/ClueIcon';
import { DetectiveIcon } from './components/icons/DetectiveIcon';
import WelcomeMessage from './components/WelcomeMessage';

type View = 'live' | 'clues';

const App: React.FC = () => {
  const [view, setView] = useState<View>('live');
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisitedCriminalVisionAI');
    if (!hasVisited) {
      setShowWelcome(true);
    }
  }, []);

  const handleWelcomeDismiss = () => {
    localStorage.setItem('hasVisitedCriminalVisionAI', 'true');
    setShowWelcome(false);
  };

  if (showWelcome) {
    return (
      <div className="bg-gray-200 min-h-screen font-serif text-gray-800" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/brick-wall.png')" }}>
         <WelcomeMessage onDismiss={handleWelcomeDismiss} />
      </div>
    )
  }

  return (
    <div className="bg-gray-200 min-h-screen font-serif text-gray-800" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/brick-wall.png')" }}>
      <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
        <header className="flex justify-center mb-6">
          <div className="bg-white/70 backdrop-blur-sm p-1 rounded-full shadow-md flex space-x-1">
            <button
              onClick={() => setView('live')}
              className={`px-4 py-2 rounded-full flex items-center transition-colors duration-300 ${view === 'live' ? 'bg-blue-600 text-white shadow-lg' : 'bg-transparent text-gray-600 hover:bg-gray-200'}`}
              aria-pressed={view === 'live'}
            >
              <DetectiveIcon className="w-5 h-5 mr-2" />
              Live Interrogation
            </button>
            <button
              onClick={() => setView('clues')}
              className={`px-4 py-2 rounded-full flex items-center transition-colors duration-300 ${view === 'clues' ? 'bg-blue-600 text-white shadow-lg' : 'bg-transparent text-gray-600 hover:bg-gray-200'}`}
              aria-pressed={view === 'clues'}
            >
              <ClueIcon className="w-5 h-5 mr-2" />
              Clue Collection
            </button>
          </div>
        </header>

        <main>
          {view === 'live' ? <LiveInterrogationView /> : <ClueCollectionView />}
        </main>
      </div>
    </div>
  );
};

export default App;