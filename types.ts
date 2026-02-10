
export interface Message {
  role: 'user' | 'model';
  text: string;
  audioBase64?: string;
  timestamp: number;
}

export interface BibleQuote {
  verse: string;
  reference: string;
}

export interface AudioState {
  isPlaying: boolean;
  isLoading: boolean;
}
