import React, { useState } from 'react';

export const EvolutionRed: React.FC = () => {
  const [view, setView] = useState<'old' | 'modern'>('old');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-paper">
      <div className="max-w-4xl w-full text-center space-y-8">
        
        <h2 className="font-serif text-4xl text-ink">The Case of a Single Word</h2>
        <p className="text-xl text-ink-light">
          What did "Red" used to mean?
        </p>

        <div className="bg-stone-100 p-2 rounded-full inline-flex relative cursor-pointer shadow-inner w-80 h-24">
            {/* Sliding Pill Background */}
            <div 
                className={`absolute top-2 bottom-2 w-[calc(50%-8px)] rounded-full bg-white shadow-md transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${view === 'old' ? 'left-2' : 'left-[calc(50%+0px)]'}`}
            />
            
            <button 
                onClick={() => setView('old')}
                className={`flex-1 relative z-10 flex flex-col items-center justify-center text-sm font-bold uppercase tracking-wider leading-tight transition-colors duration-300 gap-1 ${view === 'old' ? 'text-ink' : 'text-stone-400'}`}
            >
                <span>Old English</span>
                <span className="text-xs font-serif normal-case opacity-70">(Rēad)</span>
            </button>
            <button 
                onClick={() => setView('modern')}
                className={`flex-1 relative z-10 flex flex-col items-center justify-center text-sm font-bold uppercase tracking-wider leading-tight transition-colors duration-300 gap-1 ${view === 'modern' ? 'text-ink' : 'text-stone-400'}`}
            >
                <span>Modern English</span>
                <span className="text-xs font-serif normal-case opacity-70">(Red)</span>
            </button>
        </div>

        <div className="relative h-64 md:h-80 w-full rounded-xl overflow-hidden shadow-2xl transition-all duration-500">
            {view === 'old' ? (
                 <div className="absolute inset-0 bg-gradient-to-r from-purple-800 via-red-600 to-orange-400 flex items-center justify-center">
                    <div className="text-white/90 text-center p-4">
                        <h3 className="font-serif text-4xl md:text-6xl italic mb-2">rēad</h3>
                        <p className="text-lg">Megacategory</p>
                        <p className="text-sm opacity-75 mt-2">Includes Red, Purple, Pink, Orange, and brownish hues.</p>
                    </div>
                 </div>
            ) : (
                <div className="absolute inset-0 flex flex-col">
                    <div className="flex-1 bg-[#D93025] flex items-center justify-center text-white font-bold tracking-widest uppercase">Red</div>
                    <div className="flex-1 bg-[#9334E6] flex items-center justify-center text-white font-bold tracking-widest uppercase">Purple</div>
                    <div className="flex-1 bg-[#E91E63] flex items-center justify-center text-white font-bold tracking-widest uppercase">Pink</div>
                    <div className="flex-1 bg-[#F4511E] flex items-center justify-center text-white font-bold tracking-widest uppercase">Orange</div>
                    <div className="flex-1 bg-[#795548] flex items-center justify-center text-white font-bold tracking-widest uppercase">Brown</div>
                </div>
            )}
        </div>

        <div className="text-left bg-white p-6 rounded-lg shadow-sm border border-stone-200">
            <h4 className="font-bold text-ink mb-2">Key Insight</h4>
            <p className="text-ink-light">
                The meaning of <em>red</em> did not stay constant; it narrowed. As new words like purple, pink, and orange entered the language, they carved out their own semantic territory.
            </p>
        </div>

      </div>
    </div>
  );
};