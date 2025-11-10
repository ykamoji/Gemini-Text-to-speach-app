import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { TONE_OPTIONS, ACCENT_OPTIONS, STYLE_OPTIONS, PACING_OPTIONS } from './constants';
import { generateSpeech, listVoices } from './services/geminiService';
import { decode, concatenatePCM, createWavBlob, decodeAudioData } from './utils/audioUtils';
import type { VoiceOption } from './types';

// --- Helper UI Components (defined outside App to prevent re-creation on re-renders) ---

const Header: React.FC = () => (
  <header className="text-center mb-8">
    <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
      AI Text-to-Speech Narrator
    </h1>
    <p className="text-gray-400 mt-2 text-lg">Bring your text to life with generative AI voices.</p>
  </header>
);

const DownloadIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const PlayIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


interface VoiceSelectorProps {
  selectedVoice: string;
  onVoiceChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled: boolean;
  description: string | undefined;
  voicesByGender: Record<string, VoiceOption[]>;
  voicesLoading: boolean;
}

const VoiceSelector: React.FC<VoiceSelectorProps> = ({ selectedVoice, onVoiceChange, disabled, description, voicesByGender, voicesLoading }) => (
  <div>
    <label htmlFor="voice" className="block text-sm font-medium text-gray-300 mb-1">Voice</label>
    <select
      id="voice"
      value={selectedVoice}
      onChange={onVoiceChange}
      className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
      disabled={disabled || voicesLoading}
    >
      {voicesLoading ? (
          <option>Loading voices...</option>
      ) : (
          <>
              <optgroup label="Female">
              {(voicesByGender.female || []).map((option: VoiceOption) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
              ))}
              </optgroup>
              <optgroup label="Male">
              {(voicesByGender.male || []).map((option: VoiceOption) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
              ))}
              </optgroup>
          </>
      )}
    </select>
     {description && !voicesLoading && (
      <p className="text-xs text-gray-400 mt-2 h-8 overflow-hidden">{description}</p>
    )}
  </div>
);

interface StyleSelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
  disabled: boolean;
}

const StyleSelect: React.FC<StyleSelectProps> = ({ id, label, value, onChange, options, disabled }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
    <select
      id={id}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
    >
      {options.map((option: string) => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  </div>
);

interface ProgressBarProps {
  progress: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => (
  <div className="w-full bg-gray-700 rounded-full h-2.5 my-4">
    <div
      className="bg-gradient-to-r from-purple-500 to-cyan-500 h-2.5 rounded-full transition-all duration-300 ease-out"
      style={{ width: `${progress}%` }}
    ></div>
  </div>
);

interface AudioPlayerProps {
    audioUrl: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl }) => {
    const audioRef = useRef<HTMLAudioElement>(null);

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = audioUrl;
        link.download = `narration-${new Date().toISOString()}.wav`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="mt-6 p-4 bg-gray-800 rounded-lg flex items-center justify-between gap-4">
             <audio ref={audioRef} src={audioUrl} controls className="w-full">
                Your browser does not support the audio element.
            </audio>
            <button
                onClick={handleDownload}
                className="flex-shrink-0 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors duration-200"
                aria-label="Download narration"
            >
                <DownloadIcon />
                <span>Download</span>
            </button>
        </div>
    );
};

const LoadingSpinner: React.FC = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);


// --- Main App Component ---

const App: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [style, setStyle] = useState<string>(STYLE_OPTIONS[0]);
  const [tone, setTone] = useState<string>(TONE_OPTIONS[0]);
  const [accent, setAccent] = useState<string>(ACCENT_OPTIONS[0]);
  const [pacing, setPacing] = useState<string>(PACING_OPTIONS[0]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPreviewing, setIsPreviewing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [voicesLoading, setVoicesLoading] = useState<boolean>(true);

  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Initialize AudioContext on client-side after first render
    if (!audioContextRef.current) {
        // Fix for webkitAudioContext not being standard on the window type
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if(AudioContext) {
            audioContextRef.current = new AudioContext({ sampleRate: 24000 });
        } else {
            console.error("Web Audio API is not supported in this browser.");
        }
    }
  }, []);

  useEffect(() => {
    const fetchVoices = async () => {
        try {
            setError(null);
            setVoicesLoading(true);
            const fetchedVoices = await listVoices();
            setVoices(fetchedVoices);
            if (fetchedVoices.length > 0) {
                setSelectedVoice(fetchedVoices[0].value);
            }
        } catch (err: any) {
            setError("Failed to load available voices. Please try refreshing the page.");
            console.error("Voice fetch error:", err);
        } finally {
            setVoicesLoading(false);
        }
    };

    fetchVoices();
  }, []);

  const voicesByGender = useMemo(() => {
    return voices.reduce((acc, voice) => {
        const genderKey = voice.gender.toLowerCase();
        if (!acc[genderKey]) {
            acc[genderKey] = [];
        }
        acc[genderKey].push(voice);
        return acc;
    }, {} as Record<string, VoiceOption[]>);
  }, [voices]);

  const selectedVoiceDescription = voices.find(v => v.value === selectedVoice)?.description;

  const chunkText = (str: string, size: number): string[] => {
    const sentences = str.match(/[^.!?]+[.!?]*/g) || [];
    const chunks: string[] = [];
    let currentChunk = "";
    
    for(const sentence of sentences) {
      if(currentChunk.length + sentence.length > size) {
        chunks.push(currentChunk);
        currentChunk = sentence;
      } else {
        currentChunk += sentence;
      }
    }
    if(currentChunk) {
      chunks.push(currentChunk);
    }
    return chunks;
  };

  const handlePreview = useCallback(async () => {
    const sentences = text.trim().match(/[^.!?]+[.!?]*/g);
    const previewText = sentences && sentences.length > 0 ? sentences[0] : text.trim().split('\n')[0];

    if (!previewText || isLoading || voicesLoading || isPreviewing || !audioContextRef.current) return;

    setIsPreviewing(true);
    setError(null);

    try {
        const prompt = `Narrate the following text ${style}, at a ${pacing} pace. Use a ${tone} tone and a ${accent} accent: ${previewText}`;
        const base64Audio = await generateSpeech(prompt, selectedVoice);

        if (base64Audio) {
            const audioCtx = audioContextRef.current;
            const pcmData = decode(base64Audio);
            const audioBuffer = await decodeAudioData(pcmData, audioCtx, 24000, 1);
            
            const source = audioCtx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioCtx.destination);
            source.start(0);
        } else {
            throw new Error("Preview generation failed. No audio data was returned.");
        }
    } catch (err: any) {
        setError(err.message || 'An unknown error occurred during preview.');
        console.error(err);
    } finally {
        setIsPreviewing(false);
    }
  }, [text, selectedVoice, style, tone, accent, pacing, isLoading, isPreviewing, voicesLoading]);


  const handleGenerate = useCallback(async () => {
    if (!text || isLoading || voicesLoading || isPreviewing) return;

    setIsLoading(true);
    setProgress(0);
    setAudioUrl(null);
    setError(null);

    try {
      const chunks = chunkText(text, 2500);
      const pcmChunks: Uint8Array[] = [];

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const prompt = `Narrate the following text ${style}, at a ${pacing} pace. Use a ${tone} tone and a ${accent} accent: ${chunk}`;
        const base64Audio = await generateSpeech(prompt, selectedVoice);

        if (base64Audio) {
          pcmChunks.push(decode(base64Audio));
        } else {
            console.warn(`No audio data returned for chunk ${i+1}`);
        }
        setProgress(((i + 1) / chunks.length) * 100);
      }

      if (pcmChunks.length > 0) {
        const concatenatedPcm = concatenatePCM(pcmChunks);
        const wavBlob = createWavBlob(concatenatedPcm, 24000, 1);
        const url = URL.createObjectURL(wavBlob);
        setAudioUrl(url);
      } else {
        throw new Error("Audio generation failed. No audio data was produced.");
      }

    } catch (err: any) {
      setError(err.message || 'An unknown error occurred during generation.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [text, selectedVoice, style, tone, accent, pacing, isLoading, voicesLoading, isPreviewing]);

  const isAnyActionRunning = isLoading || isPreviewing || voicesLoading;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans p-4 md:p-8">
      <main className="max-w-4xl mx-auto">
        <Header />
        
        <div className="bg-gray-800 p-6 rounded-lg shadow-2xl">
          <fieldset disabled={isAnyActionRunning}>
            <div className="mb-4">
              <label htmlFor="text-input" className="block text-lg font-medium text-gray-300 mb-2">Your Text</label>
              <textarea
                id="text-input"
                rows={10}
                className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition text-base"
                placeholder="Enter the text you want to convert to speech..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <VoiceSelector 
                selectedVoice={selectedVoice} 
                onVoiceChange={(e) => setSelectedVoice(e.target.value)}
                disabled={isAnyActionRunning}
                description={selectedVoiceDescription}
                voicesByGender={voicesByGender}
                voicesLoading={voicesLoading}
               />
              <StyleSelect id="pacing" label="Pacing" value={pacing} onChange={(e) => setPacing(e.target.value)} options={PACING_OPTIONS} disabled={isAnyActionRunning} />
              <StyleSelect id="tone" label="Tone" value={tone} onChange={(e) => setTone(e.target.value)} options={TONE_OPTIONS} disabled={isAnyActionRunning} />
              <StyleSelect id="accent" label="Accent" value={accent} onChange={(e) => setAccent(e.target.value)} options={ACCENT_OPTIONS} disabled={isAnyActionRunning} />
            </div>
             <div className="mb-6">
                 <StyleSelect id="style" label="Style / Delivery Instruction" value={style} onChange={(e) => setStyle(e.target.value)} options={STYLE_OPTIONS} disabled={isAnyActionRunning} />
             </div>
          </fieldset>

          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <button
                onClick={handlePreview}
                disabled={isAnyActionRunning || !text}
                className="w-full sm:w-auto flex-shrink-0 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isPreviewing ? (
                    <>
                        <LoadingSpinner />
                        Previewing...
                    </>
                ) : (
                    <>
                        <PlayIcon />
                        Preview
                    </>
                )}
            </button>
            <button
                onClick={handleGenerate}
                disabled={isAnyActionRunning || !text}
                className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <>
                        <LoadingSpinner />
                        Generating...
                    </>
                ) : 'Generate Narration'}
            </button>
          </div>
        </div>

        {isLoading && (
            <div className="mt-6 p-4 bg-gray-800 rounded-lg">
                <p className="text-center text-gray-300">Processing... {Math.round(progress)}%</p>
                <ProgressBar progress={progress} />
            </div>
        )}

        {error && (
            <div className="mt-6 p-4 bg-red-900 border border-red-700 text-red-200 rounded-lg">
                <p className="font-bold">Error:</p>
                <p>{error}</p>
            </div>
        )}

        {audioUrl && !isLoading && (
            <div className="mt-6">
                <h2 className="text-2xl font-semibold mb-2 text-center text-gray-200">Your Narration is Ready</h2>
                <AudioPlayer audioUrl={audioUrl} />
            </div>
        )}

      </main>
    </div>
  );
};

export default App;