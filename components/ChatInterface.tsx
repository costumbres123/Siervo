
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { createChatSession, generateSpeech } from '../geminiService';
import AudioPlayer from './AudioPlayer';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [hasError, setHasError] = useState(false);
  const chatSessionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const initSession = async () => {
    setHasError(false);
    setIsLoading(true);
    try {
      chatSessionRef.current = createChatSession();
      const welcomeText = 'Bienvenido, amado hermano. Soy tu Siervo de Dios. ¿Qué inquietud o texto bíblico deseas que escudriñemos hoy juntos?';
      const audio = await generateSpeech(welcomeText);
      
      setMessages([{
        role: 'model',
        text: welcomeText,
        audioBase64: audio,
        timestamp: Date.now()
      }]);
    } catch (err) {
      console.error("Error initializing session:", err);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initSession();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const textToSend = inputText.trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      text: textToSend,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setHasError(false);

    try {
      if (!chatSessionRef.current) {
        chatSessionRef.current = createChatSession();
      }

      const response = await chatSessionRef.current.sendMessage({ message: textToSend });
      const modelText = response.text || "No he podido recibir la palabra en este momento.";
      
      const audioBase64 = await generateSpeech(modelText);

      const modelMessage: Message = {
        role: 'model',
        text: modelText,
        audioBase64,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, modelMessage]);
    } catch (error: any) {
      console.error("Error en la comunicación:", error);
      setHasError(true);
      const errorMessage: Message = {
        role: 'model',
        text: "Hermanito, ha ocurrido un obstáculo en nuestra conexión. Por favor, asegúrate de que la clave de API sea válida o intenta de nuevo en unos momentos.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#050505]">
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
            <span className="text-[9px] uppercase tracking-tighter text-gray-500 font-bold">Luz en tu camino</span>
          </div>
        </div>

        <button 
          onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border transition-all ${
            isVoiceEnabled ? 'gold-border gold-text bg-[#D4AF37]/10' : 'border-gray-800 text-gray-500'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
          <span className="text-[10px] font-bold uppercase tracking-widest">
            {isVoiceEnabled ? 'Audio Activo' : 'Audio Mudo'}
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
                ? 'bg-[#151515] border border-gray-800' 
                : 'dark-card border border-[#D4AF37]/20 shadow-2xl relative'
            }`}>
              <div className="prose prose-invert max-w-none">
                {msg.text.split('\n').map((line, i) => {
                  const isVerse = line.match(/[0-9]+:[0-9]+/);
                  return (
                    <p key={i} className={`mb-3 ${isVerse ? 'italic gold-text font-serif text-lg leading-relaxed' : 'text-gray-200 leading-relaxed'}`}>
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
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start animate-pulse">
            <div className="dark-card border border-[#D4AF37]/10 rounded-2xl p-4">
              <span className="text-xs gold-text italic">Buscando sabiduría en las Escrituras...</span>
            </div>
          </div>
        )}

        {hasError && (
          <div className="flex justify-center p-4">
            <button 
              onClick={handleSendMessage}
              className="text-xs gold-text border border-[#D4AF37]/30 px-4 py-2 rounded-full hover:bg-[#D4AF37]/10 transition-colors uppercase tracking-widest font-bold"
            >
              Reintentar Conexión Espiritual
            </button>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-6 border-t border-[#D4AF37]/10 bg-[#0a0a0a]">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex space-x-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
            placeholder="Haz una pregunta o pide un consejo bíblico..."
            className="flex-1 bg-[#111] border border-gray-800 rounded-full px-6 py-4 focus:outline-none focus:border-[#D4AF37] text-gray-200 placeholder-gray-600 shadow-inner disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="w-14 h-14 rounded-full gold-gradient flex items-center justify-center text-black shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-30"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
        <p className="text-[9px] text-center text-gray-700 mt-4 uppercase tracking-[0.3em] font-black">
          "Lámpara es a mis pies tu palabra, y lumbrera a mi camino"
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;
