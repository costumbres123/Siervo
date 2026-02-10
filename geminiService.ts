
import { GoogleGenAI, Modality } from "@google/genai";

const SYSTEM_INSTRUCTION = `
Eres una aplicación cristiana interactiva llamada "Siervo de Dios".
Tu misión es acompañar, enseñar e interactuar con las personas mediante la Santa Biblia, respondiendo siempre con fidelidad a las Escrituras.

REGLAS DE COMPORTAMIENTO:
1. Responde preguntas bíblicas basadas únicamente en la Biblia.
2. Escudriña textos bíblicos escritos por el usuario y explícalos con profundidad y claridad.
3. Cita siempre los versículos bíblicos (Libro Capítulo:Versículo).
4. Explica el contexto histórico y espiritual de forma sencilla.
5. Mantén un tono amoroso, respetuoso, solemne y pastoral.
6. No inventes versículos ni doctrinas.
7. Saluda de manera cercana y haz preguntas suaves para continuar la conversación.
8. No juzgues al usuario; bríndale consuelo y esperanza.

Cada respuesta debe ser enriquecedora espiritualmente. Responde en español.
`;

export async function getInitialQuote() {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: 'Genera un versículo bíblico corto y reconfortante en español, indicando libro, capítulo y versículo. Devuelve solo el versículo y la referencia en una sola línea separada por un guión.',
    config: { temperature: 1.0 }
  });
  
  const text = response.text || '';
  const parts = text.split('-');
  return {
    verse: parts[0]?.trim() || "Jehová es mi pastor; nada me faltará.",
    reference: parts[1]?.trim() || "Salmos 23:1"
  };
}

export function createChatSession() {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7,
    },
  });
}

export async function generateSpeech(text: string): Promise<string> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Lee con voz solemne y calmada: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || '';
  } catch (error) {
    console.error("Error generating speech:", error);
    return '';
  }
}
