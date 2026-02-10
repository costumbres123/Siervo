
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { createChatSession, generateSpeech } from '../geminiService';
import AudioPlayer from './AudioPlayer';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const chatSessionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatSessionRef.current = createChatSession();
    // Bienvenida
    const welcomeText = 'Bienvenido, amado hermano. Soy tu Siervo de Dios. ¿Qué inquietud o texto bíblico deseas que escudriñemos hoy juntos?';
    
    const initWelcome = async () => {
      const audio = await generateSpeech(welcomeText);
      setMessages([{
        role: 'model',
        text: welcomeText,
        audioBase64: audio,
        timestamp: Date.now()
      }]);
    };
    
    initWelcome();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      text: inputText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await chatSessionRef.current.sendMessage({ message: userMessage.text });
      const modelText = response.text;
      
      // Generar audio para cada respuesta
      const audioBase64 = await generateSpeech(modelText);

      const modelMessage: Message = {
        role: 'model',
        text: modelText,
        audioBase64,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error("Error en la comunicación:", error);
      const errorMessage: Message = {
        role: 'model',
        text: "Hermanito, he tenido una pequeña dificultad técnica. Intentemos de nuevo, con el favor de Dios.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black">
      {/* Header */}
      <header className="p-4 border-b border-[#D4AF37]/20 flex justify-between items-center bg-[#0a0a0a] sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.4)]">
            <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z"/>
            </svg>
          </div>
          <div>
            <h1 className="font-serif gold-text text-xl font-bold tracking-wider leading-none">Siervo de Dios</h1>
            <span className="text-[9px] uppercase tracking-tighter text-gray-500 font-bold">Acompañamiento Espiritual</span>
          </div>
        </div>

        <button 
          onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border transition-all ${
            isVoiceEnabled ? 'gold-border gold-text bg-white/5' : 'border-gray-800 text-gray-500'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isVoiceEnabled ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            )}
          </svg>
          <span className="text-xs font-bold uppercase tracking-widest">
            {isVoiceEnabled ? 'Voz On' : 'Voz Off'}
          </span>
        </button>
      </header>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-6 max-w-4xl mx-auto w-full scroll-smooth"
      >
        {messages.map((msg, idx) => (
          <div 
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
          >
            <div className={`max-w-[90%] md:max-w-[80%] rounded-2xl p-6 ${
              msg.role === 'user' 
                ? 'bg-[#1a1a1a] border border-gray-800 shadow-xl' 
                : 'dark-card border border-[#D4AF37]/20 shadow-2xl relative overflow-hidden'
            }`}>
              {msg.role === 'model' && (
                <div className="absolute top-0 left-0 w-1 h-full gold-bg opacity-30"></div>
              )}
              <div className="prose prose-invert prose-gold max-w-none">
                {msg.text.split('\n').map((line, i) => {
                  const isVerse = line.includes(':') || /^[0-9]/.test(line);
                  return (
                    <p key={i} className={`mb-3 ${isVerse ? 'italic gold-text font-serif text-lg border-l-2 border-[#D4AF37]/30 pl-4' : 'text-gray-200 leading-relaxed'}`}>
                      {line}
                    </p>
                  );
                })}
              </div>
              
              {msg.audioBase64 && (
                <AudioPlayer 
                  audioBase64={msg.audioBase64} 
                  autoPlay={isVoiceEnabled && idx === messages.length - 1} 
                />
              )}
              
              <span className="text-[10px] text-gray-500 mt-4 block opacity-50 uppercase tracking-widest font-bold">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="dark-card border border-[#D4AF37]/20 rounded-2xl p-5 flex items-center space-x-3">
              <div className="flex space-x-1.5">
                <div className="w-2.5 h-2.5 gold-bg rounded-full animate-bounce"></div>
                <div className="w-2.5 h-2.5 gold-bg rounded-full animate-bounce [animation-delay:-.3s]"></div>
                <div className="w-2.5 h-2.5 gold-bg rounded-full animate-bounce [animation-delay:-.5s]"></div>
              </div>
              <span className="text-sm gold-text font-serif italic tracking-wide">Escudriñando las Escrituras...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-6 border-t border-[#D4AF37]/10 bg-[#0a0a0a] shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex space-x-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Escribe tu reflexión o duda bíblica..."
            className="flex-1 bg-[#151515] border border-gray-800 rounded-full px-7 py-4 focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all text-gray-200 shadow-inner"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-14 h-14 rounded-full gold-gradient flex items-center justify-center text-black shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
        <div className="flex justify-center items-center space-x-4 mt-3">
          <p className="text-[10px] text-gray-600 uppercase tracking-[0.2em] font-bold">
            La Biblia es lámpara a mis pies
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
