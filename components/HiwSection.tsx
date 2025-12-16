import React from 'react';

export const HiwSection: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-paper">
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        
        <div className="order-2 md:order-1 space-y-8">
          <h2 className="font-serif text-4xl md:text-5xl text-ink leading-tight">
            Before there was “color,” <br/> there was <span className="italic font-bold">hiw</span>.
          </h2>
          
          <div className="prose prose-lg text-ink-light">
            <p>
              We assume that color is a fundamental property of the world. But language tells a different story.
              In Old English, the closest equivalent to "color" was <strong>hiw</strong>, a bundle of concepts including:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-4 font-serif italic text-ink">
              <li>Appearance</li>
              <li>Form or shape</li>
              <li>Beauty</li>
              <li>Figure of speech</li>
            </ul>
          </div>

          <div className="bg-orange-50 p-6 border-l-4 border-orange-300 rounded-r-lg">
            <h4 className="font-bold text-ink mb-2 uppercase text-sm tracking-wider">Key Insight</h4>
            <p className="text-sm md:text-base text-ink-light italic">
              "For the Anglo-Saxons, color wasn't an abstract quality to be isolated. It was an inseparable part of an object's total appearance."
            </p>
          </div>
        </div>

        <div className="order-1 md:order-2 flex justify-center">
          <div className="relative w-80 h-80 md:w-96 md:h-96 bg-amber-100 rounded-lg shadow-2xl rotate-3 flex items-center justify-center overflow-hidden border border-amber-200/50">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] opacity-50" />
             <span className="font-serif text-9xl italic text-ink opacity-80 z-10 font-bold" style={{ fontFamily: 'Times New Roman, serif' }}>
               hiw
             </span>
             <div className="absolute bottom-4 text-xs text-ink/40 uppercase tracking-widest">Old English</div>
          </div>
        </div>

      </div>
    </div>
  );
};
