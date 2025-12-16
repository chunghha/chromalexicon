import React, { useState } from 'react';
import { getColorEtymology } from '../services/geminiService';
import { Sparkles, Search } from 'lucide-react';

export const AiCurator: React.FC = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResponse(null);
    const result = await getColorEtymology(query);
    setResponse(result);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-stone-100">
      <div className="max-w-2xl w-full">
        
        <div className="text-center mb-10">
          <div className="inline-block p-3 bg-white rounded-full shadow-sm mb-4">
            <Sparkles className="w-6 h-6 text-accent-gold" />
          </div>
          <h2 className="font-serif text-3xl md:text-4xl text-ink mb-3">Ask the Curator</h2>
          <p className="text-ink-light">
            Enter a color name to discover its etymology and hidden history using our AI historian.
          </p>
        </div>

        <form onSubmit={handleAsk} className="relative mb-8">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., Turquoise, Magenta, Chartreuse..."
            className="w-full p-5 pr-14 rounded-full border border-stone-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-gold/50 text-lg font-serif"
          />
          <button 
            type="submit"
            disabled={loading}
            className="absolute right-2 top-2 bottom-2 aspect-square bg-ink text-white rounded-full flex items-center justify-center hover:bg-ink-light transition-colors disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
          </button>
        </form>

        {response && (
            <div className="bg-white p-8 rounded-xl shadow-lg border border-stone-200 animate-fade-in relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-accent-gold rounded-t-xl" />
                <h3 className="font-serif text-xl mb-4 capitalize text-ink">{query}</h3>
                <p className="text-ink-light leading-relaxed whitespace-pre-line">
                    {response}
                </p>
                <div className="mt-6 flex justify-end">
                     <span className="text-xs text-stone-400 uppercase tracking-widest">Powered by Gemini</span>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};
