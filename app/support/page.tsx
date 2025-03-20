'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mic, MessageSquare } from 'lucide-react';

export default function SupportChoicePage() {
  const router = useRouter();
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);

  const handleOptionClick = (path: string) => {
    router.push(path);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6">
      <h1 className="text-3xl font-bold mb-6 text-black">How would you like to contact support?</h1>
      
      <div className="flex flex-col md:flex-row gap-8 w-full max-w-3xl">
        {/* Audio Option */}
        <div 
          className={`flex-1 border-2 border-black p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
            hoveredOption === 'audio' ? 'bg-black text-white' : 'bg-white text-black'
          }`}
          onMouseEnter={() => setHoveredOption('audio')}
          onMouseLeave={() => setHoveredOption(null)}
          onClick={() => handleOptionClick('/support/audio')}
        >
          <Mic 
            size={64} 
            className={`mb-4 ${hoveredOption === 'audio' ? 'text-white' : 'text-black'}`} 
          />
          <h2 className="text-xl font-semibold mb-3">Audio Support</h2>
          <p className="text-center mb-6">Speak with our support team directly through a voice call.</p>
          <button 
            className={`px-6 py-2 border-2 transition-colors ${
              hoveredOption === 'audio' 
                ? 'border-white text-white' 
                : 'border-black text-black hover:bg-black hover:text-white'
            }`}
          >
            Start Voice Call
          </button>
        </div>

        {/* Text Option */}
        <div 
          className={`flex-1 border-2 border-black p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
            hoveredOption === 'text' ? 'bg-black text-white' : 'bg-white text-black'
          }`}
          onMouseEnter={() => setHoveredOption('text')}
          onMouseLeave={() => setHoveredOption(null)}
          onClick={() => handleOptionClick('/support/text')}
        >
          <MessageSquare 
            size={64} 
            className={`mb-4 ${hoveredOption === 'text' ? 'text-white' : 'text-black'}`} 
          />
          <h2 className="text-xl font-semibold mb-3">Text Support</h2>
          <p className="text-center mb-6">Chat with our support team through text messaging.</p>
          <button 
            className={`px-6 py-2 border-2 transition-colors ${
              hoveredOption === 'text' 
                ? 'border-white text-white' 
                : 'border-black text-black hover:bg-black hover:text-white'
            }`}
          >
            Start Text Chat
          </button>
        </div>
      </div>
    </div>
  );
}