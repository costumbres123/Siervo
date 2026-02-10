
import React, { useState, useEffect } from 'react';
import BibleVerseCard from './components/BibleVerseCard';
import ChatInterface from './components/ChatInterface';
import { BibleQuote } from './types';
import { getInitialQuote } from './geminiService';

const App: React.FC = () => {
  const [quote, setQuote] = useState<BibleQuote | null>(null);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const q = await getInitialQuote();
        setQuote(q);
      } catch (err) {
        console.error("Error fetching initial quote", err);
        setQuote({
          verse: "La paz os dejo, mi paz os doy; yo no os la doy como el mundo la da. No se turbe vuestro corazón, ni tenga miedo.",
          reference: "Juan 14:27"
        });
      }
    };
    fetchQuote();
  }, []);

  if (!showChat && quote) {
    return <BibleVerseCard quote={quote} onContinue={() => setShowChat(true)} />;
  }

  if (showChat) {
    return <ChatInterface />;
  }

  // Loading screen
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-4">
      <div className="w-16 h-16 border-4 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin"></div>
      <p className="font-serif gold-text text-xl animate-pulse italic">Inspirando tu alma...</p>
    </div>
  );
};

export default App;
