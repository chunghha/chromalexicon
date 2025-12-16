import React, { useState } from 'react';
import { BERLIN_KAY_STAGES } from '../constants';
import { ChevronRight, Info } from 'lucide-react';

export const UniversalBlueprint: React.FC = () => {
  const [activeStageId, setActiveStageId] = useState(1);
  const activeStage = BERLIN_KAY_STAGES.find(s => s.id === activeStageId) || BERLIN_KAY_STAGES[0];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-stone-50">
      <div className="max-w-5xl w-full space-y-12">
        
        <div className="text-center space-y-4">
          <h2 className="font-serif text-4xl text-ink">Exhibit I: The Universal Blueprint</h2>
          <p className="text-ink-light max-w-2xl mx-auto">
            Languages don’t invent color words randomly. They follow a remarkably predictable script.
            Explore the 7 stages of color term acquisition.
          </p>
        </div>

        {/* Visualization Area */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-stone-200 min-h-[400px] flex flex-col justify-between">
          
          <div className="mb-8">
            <div className="flex justify-between items-end mb-4 border-b pb-4 border-stone-100">
              <h3 className="font-serif text-2xl text-ink">{activeStage.title}</h3>
              <span className="text-xs uppercase tracking-widest text-stone-400">Step {activeStage.id} of 7</span>
            </div>
            <p className="text-lg text-ink-light">{activeStage.description}</p>
          </div>

          {/* Color Blocks */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {activeStage.colors.map((hex, idx) => (
              <div key={`${activeStage.id}-${idx}`} className="group relative">
                <div 
                  className="h-24 w-full rounded-lg shadow-inner border border-stone-100 transition-transform transform group-hover:-translate-y-1"
                  style={{ backgroundColor: hex }}
                />
                <span className="block mt-2 text-center text-xs font-bold uppercase text-stone-500">
                  {activeStage.colorNames[idx]}
                </span>
              </div>
            ))}
          </div>

        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-2 justify-center">
          {BERLIN_KAY_STAGES.map((stage) => (
            <button
              key={stage.id}
              onClick={() => setActiveStageId(stage.id)}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${
                activeStageId === stage.id
                  ? 'bg-ink text-white shadow-lg scale-105'
                  : 'bg-white text-ink-light hover:bg-stone-200 border border-stone-200'
              }`}
            >
              Stage {stage.id}
            </button>
          ))}
        </div>

        <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-lg text-sm text-blue-900 max-w-3xl mx-auto">
            <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>
                <strong>Key Insight:</strong> This isn't just adding words; it's about dividing perception. 
                Each new term carves out a piece from a larger "megacategory".
            </p>
        </div>

      </div>
    </div>
  );
};
