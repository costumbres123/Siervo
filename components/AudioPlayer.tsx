
import React, { useState, useRef, useEffect } from 'react';
import { decodeBase64, createWavBlob } from '../utils';

interface AudioPlayerProps {
  audioBase64: string;
  autoPlay?: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioBase64, autoPlay }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const initAudio = () => {
    if (!audioRef.current) {
      const pcmData = decodeBase64(audioBase64);
      const wavBlob = createWavBlob(pcmData);
      const url = URL.createObjectURL(wavBlob);
      audioRef.current = new Audio(url);
      audioRef.current.onended = () => setIsPlaying(false);
      audioRef.current.onplay = () => setIsPlaying(true);
      audioRef.current.onpause = () => setIsPlaying(false);
    }
  };

  useEffect(() => {
    if (autoPlay && audioBase64) {
      initAudio();
      audioRef.current?.play().catch(err => {
        console.warn("Auto-play blocked by browser. Interaction required.", err);
      });
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [audioBase64, autoPlay]);

  const handleTogglePlay = () => {
    initAudio();
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
  };

  const handleDownload = () => {
    const pcmData = decodeBase64(audioBase64);
    const wavBlob = createWavBlob(pcmData);
    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mensaje_siervo_${Date.now()}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex items-center space-x-4 mt-4 p-3 bg-white/5 rounded-xl border border-white/10">
      <button
        onClick={handleTogglePlay}
        className={`flex items-center space-x-3 text-sm transition-all duration-300 ${
          isPlaying ? 'gold-text scale-105' : 'text-gray-400 hover:text-white'
        }`}
      >
        <div className={`p-2.5 rounded-full border ${isPlaying ? 'gold-border gold-bg text-black' : 'border-current'}`}>
          {isPlaying ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          )}
        </div>
        <div className="flex flex-col items-start">
          <span className="font-bold tracking-wide uppercase text-[10px]">
            {isPlaying ? 'Escuchando la Palabra' : 'Escuchar Respuesta'}
          </span>
          {isPlaying && (
            <div className="flex items-end space-x-0.5 h-3 mt-1">
              <div className="w-0.5 bg-[#D4AF37] animate-[bounce_1s_infinite]"></div>
              <div className="w-0.5 bg-[#D4AF37] animate-[bounce_1.2s_infinite]"></div>
              <div className="w-0.5 bg-[#D4AF37] animate-[bounce_0.8s_infinite]"></div>
              <div className="w-0.5 bg-[#D4AF37] animate-[bounce_1.1s_infinite]"></div>
            </div>
          )}
        </div>
      </button>

      <div className="h-6 w-px bg-white/10"></div>

      <button
        onClick={handleDownload}
        className="text-gray-500 hover:text-white transition-colors p-2"
        title="Descargar audio"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      </button>
    </div>
  );
};

export default AudioPlayer;
