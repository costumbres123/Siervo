
import React from 'react';
import { BibleQuote } from '../types';

interface BibleVerseCardProps {
  quote: BibleQuote;
  onContinue: () => void;
}

const BibleVerseCard: React.FC<BibleVerseCardProps> = ({ quote, onContinue }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-black">
      <div className="max-w-2xl w-full text-center space-y-8 animate-fade-in">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-serif gold-text tracking-widest font-bold">SIERVO DE DIOS</h1>
          <div className="h-px w-24 gold-bg mx-auto opacity-50"></div>
        </div>

        <div className="space-y-6 dark-card p-10 rounded-2xl border border-[#D4AF37]/20 shadow-2xl">
          <p className="text-2xl md:text-3xl font-serif italic text-gray-100 leading-relaxed">
            "{quote.verse}"
          </p>
          <p className="text-lg gold-text font-medium uppercase tracking-widest">
            — {quote.reference}
          </p>
        </div>

        <button
          onClick={onContinue}
          className="px-10 py-4 rounded-full gold-gradient text-black font-bold text-lg hover:scale-105 transition-transform duration-300 shadow-[0_0_20px_rgba(212,175,55,0.3)]"
        >
          Entrar en Oración y Estudio
        </button>
      </div>
    </div>
  );
};

export default BibleVerseCard;
