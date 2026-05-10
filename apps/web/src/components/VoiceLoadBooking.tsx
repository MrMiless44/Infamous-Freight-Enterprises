import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Loader2, CheckCircle, Truck, MapPin, Clock } from 'lucide-react';

interface SpeechRecognitionResult {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent {
  readonly results: SpeechRecognitionResultList[];
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start(): void;
  stop(): void;
}

interface VoiceResult {
  command: string;
  action: string;
  matches: Array<{
    origin: string;
    dest: string;
    rate: number;
    distance: number;
    equipment: string;
  }>;
}

function getSpeechRecognitionConstructor(): (new () => SpeechRecognitionInstance) | null {
  const win = window as unknown as Record<string, unknown>;
  return (win.SpeechRecognition ?? win.webkitSpeechRecognition ?? null) as (new () => SpeechRecognitionInstance) | null;
}

const VoiceLoadBooking: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [result, setResult] = useState<VoiceResult | null>(null);
  const [loading, setLoading] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    const SpeechRecognition = getSpeechRecognitionConstructor();
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const text = Array.from(event.results)
          .map((resultList) => resultList[0].transcript)
          .join('');
        setTranscript(text);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (transcript) processCommand(transcript);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setResult(null);
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const processCommand = async (cmd: string) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));

    setResult({
      command: cmd,
      action: 'Found 3 matching loads near Dallas',
      matches: [
        { origin: 'Dallas, TX', dest: 'Houston, TX', rate: 1850, distance: 240, equipment: 'Dry Van' },
        { origin: 'Dallas, TX', dest: 'Oklahoma City, OK', rate: 2100, distance: 205, equipment: 'Reefer' },
        { origin: 'Fort Worth, TX', dest: 'San Antonio, TX', rate: 1950, distance: 260, equipment: 'Flatbed' },
      ],
    });
    setLoading(false);
  };

  const browserSupported = !!getSpeechRecognitionConstructor();

  return (
    <div className="card max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold mb-1">Voice Load Booking</h2>
        <p className="text-sm text-[#B88989]/70">Speak naturally — no typing required</p>
      </div>

      {!browserSupported && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-4 text-sm text-yellow-400">
          Voice booking needs Chrome or Edge. Switch browsers, or type your search instead.
        </div>
      )}

      {/* Mic Button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={toggleListening}
          disabled={!browserSupported}
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
            isListening
              ? 'bg-red-500 animate-pulse shadow-lg shadow-red-500/30'
              : 'bg-gradient-to-br from-infamous-orange to-infamous-orange-light hover:scale-105 shadow-xl shadow-infamous-orange/20'
          } disabled:opacity-30`}
        >
          {isListening ? <MicOff size={28} className="text-[#F5E8E8]" /> : <Mic size={28} className="text-[#F5E8E8]" />}
        </button>
      </div>

      {/* Audio Waveform */}
      {isListening && (
        <div className="flex justify-center items-center gap-1 h-10 mb-4">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-infamous-orange rounded-full"
              style={{
                height: `${Math.random() * 28 + 6}px`,
                animation: `pulse ${0.4 + Math.random() * 0.4}s ease-in-out infinite alternate`,
                animationDelay: `${i * 0.05}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Transcript */}
      {transcript && (
        <div className="bg-infamous-dark rounded-xl p-4 mb-4">
          <p className="text-xs text-[#B88989]/70 mb-1">You said:</p>
          <p className="text-[#F5E8E8] italic">"{transcript}"</p>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center gap-2 text-[#B88989] py-8">
          <Loader2 size={18} className="animate-spin" />
          <span>Analyzing your request...</span>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle size={16} className="text-green-400" />
            <span className="text-sm font-medium">{result.action}</span>
          </div>

          {result.matches.map((match, i) => (
            <div key={i} className="flex items-center gap-4 p-3 bg-infamous-dark rounded-xl border border-infamous-border hover:border-infamous-orange/30 transition-all">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin size={12} className="text-[#B88989]/70" />
                  <span>{match.origin}</span>
                  <span className="text-[#B88989]/60">→</span>
                  <span>{match.dest}</span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-[#B88989]/70">
                  <span className="flex items-center gap-1"><Truck size={10} /> {match.equipment}</span>
                  <span className="flex items-center gap-1"><Clock size={10} /> {match.distance} mi</span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-infamous-orange">${match.rate.toLocaleString()}</p>
                <p className="text-xs text-[#B88989]/70">${(match.rate / match.distance).toFixed(2)}/mi</p>
              </div>
              <button className="btn-primary text-xs py-1.5 px-3">Book</button>
            </div>
          ))}
        </div>
      )}

      {/* Suggestions */}
      {!result && !loading && !transcript && (
        <div className="grid grid-cols-1 gap-2 mt-4">
          <p className="text-xs text-[#B88989]/60 mb-2">Try saying:</p>
          {[
            '"Find me a dry van load from Chicago"',
            '"Book the highest paying reefer near Dallas"',
            '"What backhauls are available near Houston?"',
            '"Assign Marcus to the Chicago load"',
          ].map((s) => (
            <button
              key={s}
              onClick={() => { setTranscript(s.replace(/"/g, '')); processCommand(s.replace(/"/g, '')); }}
              className="text-left text-sm text-[#B88989] hover:text-[#F5E8E8] bg-infamous-dark border border-infamous-border hover:border-infamous-orange/30 rounded-xl px-4 py-2.5 transition-all"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default VoiceLoadBooking;
