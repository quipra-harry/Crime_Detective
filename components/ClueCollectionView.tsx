import React, { useState, useEffect } from 'react';
import type { Case } from '../types';
import { ClueIcon } from './icons/ClueIcon';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { ArrowRightIcon } from './icons/ArrowRightIcon';

const mockCases: Case[] = [
  {
    id: "008",
    title: "The Silent Songbird",
    description: "The person of interest is female, early 20s. Witness reports mention a distinctive music note tattoo on her right wrist. She was wearing a vintage digital watch, possibly a Casio. She has a habit of humming a melody that no one recognizes. Last seen near an old record store, she appeared anxious, clutching a single, wilting white rose.",
    images: [
      "https://storage.googleapis.com/maker-me/media/images/clue_collection_01.width-500.jpeg",
      "https://storage.googleapis.com/maker-me/media/images/clue_collection_02.width-500.jpeg",
      "https://storage.googleapis.com/maker-me/media/images/clue_collection_03.width-500.jpeg",
    ]
  },
  {
    id: "014",
    title: "The Midnight Gardener",
    description: "Suspect is a male in his late 40s with weathered hands, suggesting manual labor. He has a prominent scar above his left eyebrow and graying temples. He smells faintly of damp earth and night-blooming jasmine. He was seen carrying an antique lantern and a small, silver trowel. He has a quiet, observant demeanor.",
    images: [
      "https://storage.googleapis.com/maker-me/media/images/clue_collection_04.width-500.jpeg",
      "https://storage.googleapis.com/maker-me/media/images/clue_collection_05.width-500.jpeg",
    ]
  },
  {
    id: "021",
    title: "The Phantom of the Library",
    description: "An elderly individual, gender uncertain, always seen in a heavy, dark coat regardless of the weather. They wear thick, round spectacles and are often seen reading obscure historical texts. A key distinguishing feature is a long, elegant silver bookmark that dangles from their books. They move silently and have never been heard speaking.",
    images: [
      "https://storage.googleapis.com/maker-me/media/images/clue_collection_06.width-500.jpeg",
      "https://storage.googleapis.com/maker-me/media/images/clue_collection_07.width-500.jpeg",
      "https://storage.googleapis.com/maker-me/media/images/clue_collection_08.width-500.jpeg",
      "https://storage.googleapis.com/maker-me/media/images/clue_collection_09.width-500.jpeg",
    ]
  }
];

const ClueCollectionView: React.FC = () => {
  const [currentCaseIndex, setCurrentCaseIndex] = useState(0);
  
  const currentCase = mockCases[currentCaseIndex];
  
  const goToPrevious = () => {
    setCurrentCaseIndex((prevIndex) => (prevIndex === 0 ? mockCases.length - 1 : prevIndex - 1));
  };

  const goToNext = () => {
    setCurrentCaseIndex((prevIndex) => (prevIndex === mockCases.length - 1 ? 0 : prevIndex + 1));
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-2xl max-w-5xl mx-auto">
      <header className="flex items-center space-x-3 text-gray-500 mb-6">
        <ClueIcon className="w-6 h-6" />
        <h1 className="text-xl font-bold">Clue Collection</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="bg-gray-100 p-6 rounded-lg shadow-inner">
          <h2 className="text-sm font-semibold text-gray-500">Case #{currentCase.id}</h2>
          <h3 className="text-3xl font-bold text-gray-800 mt-1 mb-4">{currentCase.title}</h3>
          <p className="text-gray-600 leading-relaxed">{currentCase.description}</p>
        </div>

        <div className="relative h-96 w-full flex items-center justify-center">
          {currentCase.images.map((img, index) => {
             const centerIndex = (currentCase.images.length - 1) / 2;
             const offset = index - centerIndex;
             const scale = 1 - Math.abs(offset) * 0.1;
             const translateX = offset * 40;
             const rotate = offset * 8;
             const zIndex = currentCase.images.length - Math.abs(offset);
             const opacity = 1 - Math.abs(offset) * 0.2;
             const filter = `blur(${Math.abs(offset)}px)`;

             return (
                <div
                    key={index}
                    className="absolute w-64 h-64 transition-all duration-500 ease-in-out"
                    style={{
                        transform: `translateX(${translateX}px) scale(${scale}) rotate(${rotate}deg)`,
                        zIndex,
                        opacity,
                        filter,
                    }}
                >
                    <img
                        src={img}
                        alt={`Evidence ${index + 1}`}
                        className="w-full h-full object-cover rounded-xl shadow-2xl border-4 border-white"
                    />
                </div>
             )
          })}
        </div>
      </div>

      <div className="flex justify-center items-center mt-8 space-x-4">
        <button onClick={goToPrevious} className="p-3 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors">
          <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
        </button>
        <span className="text-gray-600 font-medium">{currentCaseIndex + 1} / {mockCases.length}</span>
        <button onClick={goToNext} className="p-3 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors">
          <ArrowRightIcon className="w-6 h-6 text-gray-700" />
        </button>
      </div>
    </div>
  );
};

export default ClueCollectionView;