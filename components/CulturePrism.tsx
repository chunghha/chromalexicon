import React, { useState, useEffect } from 'react';
import { CULTURAL_MEANINGS } from '../constants';
import { generateCulturalImage } from '../services/geminiService';
import { Loader2, Image as ImageIcon, ArrowRight } from 'lucide-react';

// --- Sound Utility ---
const getAudioContext = () => {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return null;
  return new AudioContext();
};

const playSwitchSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  // A low, tactile "thock" sound
  osc.type = 'sine';
  osc.frequency.setValueAtTime(200, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.1);

  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.15);
};

const playMagicSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  // A gentle major chord shimmer
  const notes = [523.25, 659.25, 783.99, 1046.50]; // C Major
  const now = ctx.currentTime;

  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.05, now + 0.05 + (i * 0.05));
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 3);
  });
};
// ---------------------

export const CulturePrism: React.FC = () => {
  const [activeColorIdx, setActiveColorIdx] = useState(0);
  const data = CULTURAL_MEANINGS[activeColorIdx];
  const isWhiteTheme = data.color === 'White';

  const [westernImage, setWesternImage] = useState<string | null>(null);
  const [easternImage, setEasternImage] = useState<string | null>(null);
  const [loadingSide, setLoadingSide] = useState<'western' | 'eastern' | null>(null);
  const [activeMeaning, setActiveMeaning] = useState<{western: string | null, eastern: string | null}>({ western: null, eastern: null });

  // Reset images when color changes
  useEffect(() => {
    setWesternImage(null);
    setEasternImage(null);
    setActiveMeaning({ western: null, eastern: null });
    setLoadingSide(null);
  }, [activeColorIdx]);

  const handleColorChange = (idx: number) => {
    playSwitchSound();
    setActiveColorIdx(idx);
  };

  const handleMeaningClick = async (side: 'western' | 'eastern', meaning: string) => {
    if (loadingSide) return;
    
    playMagicSound();
    setLoadingSide(side);
    setActiveMeaning(prev => ({ ...prev, [side]: meaning }));
    
    // Explicitly using 'Chinese' for Eastern to guide the model better based on the UI text
    const cultureContext = side === 'western' ? 'Western' : 'Chinese';
    
    const image = await generateCulturalImage(meaning, data.color, cultureContext);
    
    if (image) {
        if (side === 'western') setWesternImage(image);
        else setEasternImage(image);
    }
    setLoadingSide(null);
  };

  const handleNext = (side: 'western' | 'eastern') => {
    if (loadingSide) return;

    const cultureData = data[side];
    const allMeanings = [...cultureData.positive, ...cultureData.negative];
    const currentMeaning = activeMeaning[side];
    
    let nextMeaning = allMeanings[0];
    
    if (currentMeaning) {
        const currentIndex = allMeanings.indexOf(currentMeaning);
        if (currentIndex >= 0) {
            nextMeaning = allMeanings[(currentIndex + 1) % allMeanings.length];
        }
    }
    
    handleMeaningClick(side, nextMeaning);
  };

  const renderVisualizer = (side: 'western' | 'eastern', currentImage: string | null) => {
     const isLoading = loadingSide === side;
     const currentMeaning = activeMeaning[side];
     
     return (
        <div className={`w-full h-48 rounded-lg mb-6 shadow-inner relative overflow-hidden group border ${isWhiteTheme ? 'bg-stone-800 border-stone-700' : 'bg-stone-100 border-stone-200'}`}>
            {/* Base Color Background */}
            <div 
                className="absolute inset-0"
                style={{ backgroundColor: data.hex }} 
            />
            
            {/* Generated Image */}
            {currentImage && !isLoading && (
                <img 
                    src={currentImage} 
                    alt={`Visualization of ${currentMeaning}`}
                    className="absolute inset-0 w-full h-full object-cover animate-in fade-in duration-700"
                />
            )}

            {/* Loading Overlay */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10 backdrop-blur-sm">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
            )}

            {/* Overlay Text for Generated Image */}
            {currentImage && !isLoading && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-white text-xs font-serif italic">"{currentMeaning}"</p>
                </div>
            )}
            
            {/* Call to Action (Only if no image and not loading) */}
            {!currentImage && !isLoading && (
                 <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className="bg-black/20 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-medium flex items-center gap-2 shadow-lg border border-white/10">
                        <ImageIcon className="w-4 h-4" />
                        Select a meaning below
                    </div>
                 </div>
            )}
        </div>
     );
  };

  return (
    <div className="min-h-screen flex flex-col items-center pt-24 pb-12 px-8 bg-paper">
      <div className="max-w-6xl w-full">
        
        <h2 className="font-serif text-4xl text-ink mb-2">Exhibit II: The Prism of Culture</h2>
        <p className="text-ink-light mb-12">Naming a color is only the beginning. Click a meaning to visualize how culture gives it a soul.</p>

        {/* Toggle */}
        <div className="flex gap-4 mb-8">
            {CULTURAL_MEANINGS.map((item, idx) => (
                <button
                    key={item.color}
                    onClick={() => handleColorChange(idx)}
                    className={`px-6 py-2 rounded-lg font-serif text-lg border-2 transition-all ${
                        activeColorIdx === idx 
                        ? 'border-ink bg-ink text-white' 
                        : 'border-transparent text-ink-light hover:bg-stone-100'
                    }`}
                >
                    {item.color}
                </button>
            ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
          
          {/* Western */}
          <div className={`p-8 rounded-xl shadow-sm border transition-colors duration-500 ${isWhiteTheme ? 'bg-stone-900 border-stone-800 text-stone-100' : 'bg-white border-stone-100'}`}>
            <div className={`flex justify-between items-end mb-6 border-b pb-2 ${isWhiteTheme ? 'border-stone-800' : 'border-stone-100'}`}>
                <h3 className="font-serif text-2xl">Western Traditions</h3>
                <button 
                    onClick={() => handleNext('western')}
                    disabled={loadingSide === 'western'}
                    className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-stone-400 hover:text-accent-gold transition-colors disabled:opacity-50"
                >
                    Next Meaning <ArrowRight className="w-3 h-3" />
                </button>
            </div>
            
            {renderVisualizer('western', westernImage)}
            
            <div className="space-y-6">
                <div>
                    <h4 className={`text-xs font-bold uppercase mb-2 ${isWhiteTheme ? 'text-green-400' : 'text-green-700'}`}>Positive Associations</h4>
                    <div className="flex flex-wrap gap-2">
                        {data.western.positive.map(t => (
                            <button 
                                key={t} 
                                onClick={() => handleMeaningClick('western', t)}
                                className={`px-3 py-1 rounded-full text-sm transition-all border ${
                                    activeMeaning.western === t 
                                    ? 'bg-green-600 text-white border-green-600 shadow-md transform scale-105' 
                                    : isWhiteTheme
                                        ? 'bg-green-900/30 text-green-300 border-transparent hover:bg-green-900/50 hover:border-green-800'
                                        : 'bg-green-50 text-green-800 border-transparent hover:bg-green-100 hover:border-green-200'
                                }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <h4 className={`text-xs font-bold uppercase mb-2 ${isWhiteTheme ? 'text-red-400' : 'text-red-700'}`}>Negative Associations</h4>
                    <div className="flex flex-wrap gap-2">
                        {data.western.negative.map(t => (
                            <button 
                                key={t} 
                                onClick={() => handleMeaningClick('western', t)}
                                className={`px-3 py-1 rounded-full text-sm transition-all border ${
                                    activeMeaning.western === t 
                                    ? 'bg-red-600 text-white border-red-600 shadow-md transform scale-105' 
                                    : isWhiteTheme
                                        ? 'bg-red-900/30 text-red-300 border-transparent hover:bg-red-900/50 hover:border-red-800'
                                        : 'bg-red-50 text-red-800 border-transparent hover:bg-red-100 hover:border-red-200'
                                }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
          </div>

          {/* Eastern */}
          <div className={`p-8 rounded-xl shadow-sm border transition-colors duration-500 ${isWhiteTheme ? 'bg-stone-900 border-stone-800 text-stone-100' : 'bg-white border-stone-100'}`}>
            <div className={`flex justify-between items-end mb-6 border-b pb-2 ${isWhiteTheme ? 'border-stone-800' : 'border-stone-100'}`}>
                <h3 className="font-serif text-2xl">Chinese Traditions</h3>
                <button 
                    onClick={() => handleNext('eastern')}
                    disabled={loadingSide === 'eastern'}
                    className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-stone-400 hover:text-accent-gold transition-colors disabled:opacity-50"
                >
                    Next Meaning <ArrowRight className="w-3 h-3" />
                </button>
            </div>
            
            {renderVisualizer('eastern', easternImage)}
            
            <div className="space-y-6">
                <div>
                    <h4 className={`text-xs font-bold uppercase mb-2 ${isWhiteTheme ? 'text-green-400' : 'text-green-700'}`}>Positive Associations</h4>
                    <div className="flex flex-wrap gap-2">
                        {data.eastern.positive.map(t => (
                             <button 
                                key={t} 
                                onClick={() => handleMeaningClick('eastern', t)}
                                className={`px-3 py-1 rounded-full text-sm transition-all border ${
                                    activeMeaning.eastern === t 
                                    ? 'bg-green-600 text-white border-green-600 shadow-md transform scale-105' 
                                    : isWhiteTheme
                                        ? 'bg-green-900/30 text-green-300 border-transparent hover:bg-green-900/50 hover:border-green-800'
                                        : 'bg-green-50 text-green-800 border-transparent hover:bg-green-100 hover:border-green-200'
                                }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <h4 className={`text-xs font-bold uppercase mb-2 ${isWhiteTheme ? 'text-red-400' : 'text-red-700'}`}>Negative Associations</h4>
                    <div className="flex flex-wrap gap-2">
                        {data.eastern.negative.map(t => (
                            <button 
                                key={t} 
                                onClick={() => handleMeaningClick('eastern', t)}
                                className={`px-3 py-1 rounded-full text-sm transition-all border ${
                                    activeMeaning.eastern === t 
                                    ? 'bg-red-600 text-white border-red-600 shadow-md transform scale-105' 
                                    : isWhiteTheme
                                        ? 'bg-red-900/30 text-red-300 border-transparent hover:bg-red-900/50 hover:border-red-800'
                                        : 'bg-red-50 text-red-800 border-transparent hover:bg-red-100 hover:border-red-200'
                                }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};