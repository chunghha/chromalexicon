import React from 'react';

export const Hero: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center relative overflow-hidden bg-paper">
      
      <style>{`
        @keyframes drift {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0, 0) scale(1); }
        }
        @keyframes aurora {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(30px) scale(0.98); filter: blur(10px); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0px); }
        }
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .grain-overlay {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E");
        }
        
        /* Apple-style Easing */
        .apple-ease {
          animation-timing-function: cubic-bezier(0.25, 1, 0.5, 1);
          animation-fill-mode: forwards;
          opacity: 0;
        }
        
        .anim-delay-0 { animation-delay: 0ms; }
        .anim-delay-200 { animation-delay: 200ms; }
        .anim-delay-400 { animation-delay: 400ms; }
        .anim-delay-800 { animation-delay: 800ms; }
      `}</style>

      {/* Base Animated Gradient */}
      <div 
        className="absolute inset-0 z-0 bg-gradient-to-br from-[#fdfbf7] via-[#f3e7ff] to-[#fff0e6] bg-[length:400%_400%] opacity-100" 
        style={{ animation: 'aurora 20s ease infinite' }} 
      />

      {/* Floating Ethereal Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-purple-300/20 rounded-full blur-[120px] mix-blend-multiply animate-[drift_25s_infinite_ease-in-out]" />
      <div className="absolute top-[10%] right-[-20%] w-[60vw] h-[60vw] bg-[#d4af37]/15 rounded-full blur-[100px] mix-blend-multiply animate-[drift_30s_infinite_ease-in-out_reverse]" />
      <div className="absolute bottom-[-10%] left-[20%] w-[50vw] h-[50vw] bg-blue-200/20 rounded-full blur-[120px] mix-blend-multiply animate-[drift_35s_infinite_ease-in-out_5s]" />

      {/* Grain Texture Overlay for 'Paper' feel */}
      <div className="absolute inset-0 z-0 grain-overlay opacity-[0.03] pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-4xl">
        <h1 className="font-serif text-5xl md:text-8xl text-ink mb-8 leading-tight drop-shadow-sm tracking-tight apple-ease anim-delay-0" style={{ animationName: 'fadeInUp', animationDuration: '1.2s' }}>
          How We See <br />
          <span 
            className="italic text-transparent bg-clip-text bg-gradient-to-r from-ink via-ink-light to-ink bg-[length:200%_auto]" 
            style={{ animation: 'gradient-x 8s ease infinite' }}
          >
            What We Say
          </span>
        </h1>
        
        <div className="flex items-center justify-center gap-4 mb-10 opacity-60 apple-ease anim-delay-200" style={{ animationName: 'fadeInUp', animationDuration: '1.2s' }}>
            <div className="h-px w-12 bg-ink"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-ink"></div>
            <div className="h-px w-12 bg-ink"></div>
        </div>

        <p className="font-sans text-xl md:text-3xl text-ink-light font-light tracking-wide max-w-2xl mx-auto leading-relaxed apple-ease anim-delay-400" style={{ animationName: 'fadeInUp', animationDuration: '1.4s' }}>
          A Curated Tour of the <span className="font-medium text-ink">Language of Color</span>
        </p>
        
        <div className="mt-16 flex flex-col items-center gap-2 text-ink/30 apple-ease anim-delay-800" style={{ animationName: 'fadeInUp', animationDuration: '1.6s' }}>
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold animate-pulse">Begin Journey</span>
          <div className="w-px h-12 bg-gradient-to-b from-ink/30 to-transparent"></div>
        </div>
      </div>
    </div>
  );
};