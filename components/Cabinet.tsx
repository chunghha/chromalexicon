import React, { useState, useEffect, useRef } from 'react';
import { PIGMENTS } from '../constants';
import { getPigmentVisualization, getPigment3DModel } from '../services/geminiService';
import { Loader2, Image as ImageIcon, Box, X, ZoomIn, ZoomOut, RotateCcw, RotateCw, RefreshCcw, Move, MousePointer2, Maximize2, Sparkles, Hexagon, ArrowDown, Copy, Check } from 'lucide-react';
import { Pigment } from '../types';

interface CabinetProps {
  onNavigateToIscc?: () => void;
}

export const Cabinet: React.FC<CabinetProps> = ({ onNavigateToIscc }) => {
  const [images, setImages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  
  // Unified Viewer State (2D & 3D)
  const [activeView, setActiveView] = useState<{ pigment: Pigment; mode: '2d' | '3d' } | null>(null);
  
  // 3D Specific Resources
  const [modelImages, setModelImages] = useState<Record<string, string>>({}); // Key: "id-raw" or "id-polished"
  const [loadingModel, setLoadingModel] = useState(false);
  const [textureMode, setTextureMode] = useState<'raw' | 'polished'>('raw');
  
  // Viewer Transformation State
  const [transform, setTransform] = useState({ scale: 1, rotate: 0, x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Touch State Refs
  const lastTouchRef = useRef<{ x: number; y: number } | null>(null);
  const lastDistRef = useRef<number | null>(null);

  // Reset transform when opening new view
  useEffect(() => {
    setTransform({ scale: 1, rotate: 0, x: 0, y: 0 });
  }, [activeView]);

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const handleCardClick = async (pigment: Pigment) => {
    // If currently loading this pigment, do nothing
    if (loading[pigment.id]) return;

    // If image already exists, open the interactive viewer (2D mode)
    if (images[pigment.id]) {
        setActiveView({ pigment, mode: '2d' });
        return;
    }

    // Otherwise, generate the visualization
    setLoading(prev => ({ ...prev, [pigment.id]: true }));
    const imageUrl = await getPigmentVisualization(pigment.name, pigment.description);
    if (imageUrl) {
        setImages(prev => ({ ...prev, [pigment.id]: imageUrl }));
    }
    setLoading(prev => ({ ...prev, [pigment.id]: false }));
  };

  const handleOpen3D = async (e: React.MouseEvent, pigment: Pigment) => {
    e.stopPropagation();
    setActiveView({ pigment, mode: '3d' });
    setTextureMode('raw'); // Reset to default raw state

    const key = `${pigment.id}-raw`;
    if (!modelImages[key]) {
      setLoadingModel(true);
      const img = await getPigment3DModel(pigment.name, pigment.description, 'raw');
      if (img) {
        setModelImages(prev => ({ ...prev, [key]: img }));
      }
      setLoadingModel(false);
    }
  };

  const toggleTextureMode = async () => {
    if (!activeView || activeView.mode !== '3d') return;
    
    const newMode = textureMode === 'raw' ? 'polished' : 'raw';
    setTextureMode(newMode);
    
    const key = `${activeView.pigment.id}-${newMode}`;
    if (!modelImages[key]) {
        setLoadingModel(true);
        const img = await getPigment3DModel(activeView.pigment.name, activeView.pigment.description, newMode);
        if (img) {
            setModelImages(prev => ({ ...prev, [key]: img }));
        }
        setLoadingModel(false);
    }
  };

  const closeViewer = () => {
    setActiveView(null);
  };

  // --- Viewer Controls (Shared) ---
  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    const scaleAdjustment = -e.deltaY * 0.001;
    setTransform(prev => ({
        ...prev,
        scale: Math.min(Math.max(prev.scale + scaleAdjustment, 0.5), 5)
    }));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = { x: e.clientX - transform.x, y: e.clientY - transform.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    setTransform(prev => ({
        ...prev,
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch Handlers for Pinch Zoom and Pan
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      lastTouchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      lastDistRef.current = dist;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Note: touch-action: none is applied via 'touch-none' class on the container
    
    if (e.touches.length === 1 && lastTouchRef.current) {
        // Pan
        const x = e.touches[0].clientX;
        const y = e.touches[0].clientY;
        const deltaX = x - lastTouchRef.current.x;
        const deltaY = y - lastTouchRef.current.y;
        
        setTransform(prev => ({
            ...prev,
            x: prev.x + deltaX,
            y: prev.y + deltaY
        }));
        
        lastTouchRef.current = { x, y };
    } else if (e.touches.length === 2 && lastDistRef.current) {
        // Pinch Zoom
        const dist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
        );
        
        const ratio = dist / lastDistRef.current;
        
        setTransform(prev => ({
            ...prev,
            scale: Math.min(Math.max(prev.scale * ratio, 0.5), 5)
        }));
        
        lastDistRef.current = dist;
    }
  };

  const handleTouchEnd = () => {
    lastTouchRef.current = null;
    lastDistRef.current = null;
  };
  
  const resetView = () => {
    setTransform({ scale: 1, rotate: 0, x: 0, y: 0 });
  };

  const updateRotate = (delta: number) => {
    setTransform(prev => ({ ...prev, rotate: prev.rotate + delta }));
  };

  const updateScale = (delta: number) => {
    setTransform(prev => ({
        ...prev,
        scale: Math.min(Math.max(prev.scale + delta, 0.5), 5)
    }));
  };

  // Helper to get current display image based on mode
  const currentImage = activeView?.mode === '3d' 
    ? modelImages[`${activeView.pigment.id}-${textureMode}`] 
    : (activeView ? images[activeView.pigment.id] : null);

  const isLoadingViewer = activeView?.mode === '3d' ? loadingModel : false;

  return (
    <div className="min-h-screen flex flex-col justify-center p-8 bg-[#2d2a26] text-[#fdfbf7] relative">
      <div className="max-w-7xl mx-auto w-full">
        
        <div className="mb-12 border-b border-[#fdfbf7]/20 pb-8">
            <h2 className="font-serif text-4xl mb-4 text-[#d4af37]">Exhibit III: A Cabinet of Linguistic Curiosities</h2>
            <p className="text-[#fdfbf7]/70 text-lg max-w-3xl">
                Beyond the basics lies a lost lexicon of color. Click on any specimen card to visualize its physical origin from the archives.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {PIGMENTS.map((pigment) => {
                const isLoading = loading[pigment.id];
                const hasImage = !!images[pigment.id];

                return (
                    <div 
                        key={pigment.id}
                        className="group relative bg-[#3a3632] rounded-lg overflow-hidden border border-[#fdfbf7]/10 hover:border-[#d4af37]/50 transition-all duration-300"
                    >
                        <button 
                            onClick={() => handleCardClick(pigment)}
                            disabled={isLoading}
                            className="w-full text-left focus:outline-none"
                        >
                            <div 
                                className="h-48 w-full relative transition-all duration-500 overflow-hidden"
                                style={{ backgroundColor: hasImage ? 'transparent' : pigment.hex }}
                            >
                                {/* Initial Generation CTA */}
                                {!hasImage && !isLoading && (
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20">
                                        <span className="flex items-center gap-2 text-white font-serif text-sm bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                                            <ImageIcon className="w-4 h-4" />
                                            Visualize Source
                                        </span>
                                    </div>
                                )}

                                {/* Expand/Zoom CTA (When image exists) */}
                                {hasImage && (
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40">
                                        <span className="flex items-center gap-2 text-white font-serif text-sm bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm border border-white/20">
                                            <Maximize2 className="w-4 h-4" />
                                            Expand & Zoom
                                        </span>
                                    </div>
                                )}

                                {/* Loading State */}
                                {isLoading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
                                        <Loader2 className="w-8 h-8 text-[#d4af37] animate-spin" />
                                    </div>
                                )}

                                {/* Generated Image Thumbnail */}
                                {hasImage && (
                                    <img 
                                        src={images[pigment.id]} 
                                        alt={`Source of ${pigment.name}`}
                                        className="w-full h-full object-cover animate-in fade-in duration-700"
                                    />
                                )}
                            </div>

                            <div className="p-6 pb-12">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-serif text-xl text-[#d4af37]">{pigment.name}</h3>
                                    {hasImage && <span className="text-[10px] uppercase tracking-widest text-green-400/80 border border-green-400/30 px-2 py-0.5 rounded">Visualized</span>}
                                </div>
                                <p className="text-sm text-[#fdfbf7]/90 mb-4 h-20 overflow-y-auto scrollbar-hide leading-relaxed">
                                    {pigment.description}
                                </p>
                                
                                {/* Explicit Generate Button (Visual Only, click handled by parent) */}
                                {!hasImage && !isLoading && (
                                    <div className="mb-4">
                                        <span className="inline-flex items-center gap-1.5 bg-[#fdfbf7]/10 hover:bg-[#d4af37] text-[#fdfbf7] hover:text-[#2d2a26] px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors border border-[#fdfbf7]/10 group-hover:border-[#d4af37]/30">
                                            <Sparkles className="w-3 h-3" />
                                            Generate Origin
                                        </span>
                                    </div>
                                )}

                                <div className="text-xs text-[#fdfbf7]/50 italic border-t border-[#fdfbf7]/10 pt-4 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
                                    Origin: {pigment.origin}
                                </div>
                            </div>
                        </button>

                        {/* 3D Button - Placed absolutely at bottom right */}
                        <div className="absolute bottom-4 right-4 z-20">
                             <button 
                                onClick={(e) => handleOpen3D(e, pigment)}
                                className="flex items-center gap-1.5 bg-black/40 hover:bg-[#d4af37] text-white hover:text-[#2d2a26] text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10 transition-all duration-300"
                             >
                                <Box className="w-3 h-3" />
                                3D Model
                             </button>
                        </div>
                    </div>
                );
            })}
        </div>
        
        {onNavigateToIscc && (
            <div className="flex justify-center pb-8">
              <button 
                onClick={onNavigateToIscc}
                className="group flex items-center gap-3 px-8 py-4 bg-[#3a3632] hover:bg-[#d4af37] text-[#fdfbf7] hover:text-[#2d2a26] rounded-full transition-all duration-500 shadow-xl border border-[#fdfbf7]/10 hover:shadow-[#d4af37]/20"
              >
                <div className="flex flex-col items-start">
                    <span className="font-serif text-sm font-semibold tracking-wide">Enter the Standardized World</span>
                    <span className="text-[10px] opacity-60 uppercase tracking-widest font-sans">Exhibit IV</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-[#2d2a26]/20 transition-colors">
                    <ArrowDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
                </div>
              </button>
            </div>
        )}

      </div>

      {/* Unified Interactive Viewer Modal */}
      {activeView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={closeViewer} />
            
            <div className="relative w-full max-w-5xl bg-[#1a1816] rounded-2xl overflow-hidden shadow-2xl border border-[#d4af37]/20 flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-300 h-[80vh]">
                
                <button 
                    onClick={closeViewer}
                    className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-white/20 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Left: Interactive Viewport */}
                <div className="w-full md:w-3/4 bg-gradient-to-br from-[#2a2622] to-[#000] relative flex items-center justify-center overflow-hidden group">
                    
                    {/* Grid Background */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none" 
                        style={{ backgroundImage: 'linear-gradient(#d4af37 1px, transparent 1px), linear-gradient(90deg, #d4af37 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
                    />

                    {isLoadingViewer ? (
                         <div className="flex flex-col items-center gap-4 z-10">
                            <Loader2 className="w-12 h-12 text-[#d4af37] animate-spin" />
                            <p className="text-[#d4af37] text-sm font-mono animate-pulse">
                                {activeView.mode === '3d' 
                                    ? (textureMode === 'raw' ? 'RENDERING RAW MATERIAL...' : 'RENDERING POLISHED PIGMENT...') 
                                    : 'LOADING VISUALIZATION...'}
                            </p>
                         </div>
                    ) : (
                        currentImage ? (
                            <div 
                                className={`relative w-full h-full flex items-center justify-center cursor-move touch-none ${isDragging ? 'cursor-grabbing' : ''}`}
                                onWheel={handleWheel}
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                                onTouchStart={handleTouchStart}
                                onTouchMove={handleTouchMove}
                                onTouchEnd={handleTouchEnd}
                            >
                                <img 
                                    src={currentImage} 
                                    alt="Detail View" 
                                    style={{ 
                                        transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale}) rotate(${transform.rotate}deg)`,
                                        transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                                    }}
                                    className="max-w-none max-h-none object-contain drop-shadow-2xl select-none" 
                                    draggable={false}
                                />
                                
                                {/* Status Overlay */}
                                <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
                                     <div className="bg-black/60 px-3 py-1 rounded text-xs text-white/70 font-mono flex items-center gap-2 backdrop-blur-sm border border-white/5">
                                        <MousePointer2 className="w-3 h-3" />
                                        Pan: Drag
                                    </div>
                                    <div className="bg-[#d4af37]/20 text-[#d4af37] px-3 py-1 rounded text-xs font-mono backdrop-blur-sm border border-[#d4af37]/30">
                                        {activeView.mode === '3d' ? '3D MODEL' : '2D VIEW'} | Scale: {transform.scale.toFixed(1)}x
                                    </div>
                                </div>

                                {/* Controls Toolbar */}
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md rounded-2xl border border-white/10 p-3 flex flex-col md:flex-row items-center gap-4 shadow-xl z-20 min-w-max">
                                    
                                    {/* Zoom Section */}
                                    <div className="flex items-center gap-3 bg-white/5 rounded-lg px-3 py-1.5">
                                        <button 
                                            onClick={() => updateScale(-0.5)} 
                                            className="p-1 hover:text-[#d4af37] text-white/70 transition-colors"
                                            title="Zoom Out"
                                        >
                                            <ZoomOut className="w-4 h-4" />
                                        </button>
                                        <input 
                                            type="range" 
                                            min="0.5" 
                                            max="5" 
                                            step="0.1" 
                                            value={transform.scale} 
                                            onChange={(e) => setTransform(prev => ({ ...prev, scale: parseFloat(e.target.value) }))}
                                            className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#d4af37] hover:bg-white/30 transition-colors"
                                        />
                                        <button 
                                            onClick={() => updateScale(0.5)} 
                                            className="p-1 hover:text-[#d4af37] text-white/70 transition-colors"
                                            title="Zoom In"
                                        >
                                            <ZoomIn className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Rotate Section */}
                                    <div className="flex items-center gap-3 bg-white/5 rounded-lg px-3 py-1.5">
                                        <button 
                                            onClick={() => updateRotate(-90)} 
                                            className="p-1 hover:text-[#d4af37] text-white/70 transition-colors"
                                            title="Rotate -90°"
                                        >
                                            <RotateCcw className="w-4 h-4" />
                                        </button>
                                        <input 
                                            type="range" 
                                            min="0" 
                                            max="360" 
                                            value={transform.rotate} 
                                            onChange={(e) => setTransform(prev => ({ ...prev, rotate: parseInt(e.target.value) }))}
                                            className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#d4af37] hover:bg-white/30 transition-colors"
                                        />
                                        <button 
                                            onClick={() => updateRotate(90)} 
                                            className="p-1 hover:text-[#d4af37] text-white/70 transition-colors"
                                            title="Rotate +90°"
                                        >
                                            <RotateCw className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Texture Toggle (Only for 3D) */}
                                    {activeView.mode === '3d' && (
                                        <>
                                            <div className="w-px h-4 bg-white/10" />
                                            <button 
                                                onClick={toggleTextureMode}
                                                className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/10 rounded-lg text-white/70 hover:text-[#d4af37] transition-all text-xs font-bold uppercase tracking-wider min-w-[100px] justify-center"
                                                title="Switch Texture"
                                            >
                                                {textureMode === 'raw' ? (
                                                    <>
                                                        <Hexagon className="w-3.5 h-3.5" /> Raw
                                                    </>
                                                ) : (
                                                    <>
                                                        <Sparkles className="w-3.5 h-3.5" /> Polished
                                                    </>
                                                )}
                                            </button>
                                        </>
                                    )}

                                    <div className="w-full md:w-px h-px md:h-8 bg-white/10" />

                                    <button 
                                        onClick={resetView} 
                                        className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/10 rounded-lg text-white/70 hover:text-[#d4af37] transition-all text-xs font-bold uppercase tracking-wider" 
                                        title="Reset View"
                                    >
                                        <RefreshCcw className="w-3.5 h-3.5" />
                                        Reset
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-red-400">Failed to load content</div>
                        )
                    )}
                </div>

                {/* Right: Info Panel */}
                <div className="w-full md:w-1/4 p-8 border-l border-[#ffffff]/5 flex flex-col bg-[#2d2a26] overflow-y-auto">
                    <div className="mb-2">
                        <span className="text-[#d4af37] text-xs font-bold uppercase tracking-[0.2em]">Exhibit Artifact</span>
                    </div>
                    <h3 className="font-serif text-3xl text-white mb-6">{activeView.pigment.name}</h3>
                    
                    <div className="space-y-6 text-[#fdfbf7]/80">
                        <div>
                            <h4 className="text-xs uppercase tracking-wider text-[#fdfbf7]/40 mb-1">
                                {activeView.mode === '3d' 
                                    ? (textureMode === 'raw' ? 'Raw Material Source' : 'Refined Pigment State')
                                    : 'Visualized Specimen'}
                            </h4>
                            <p className="font-serif italic">{activeView.pigment.description}</p>
                        </div>
                        <div>
                            <h4 className="text-xs uppercase tracking-wider text-[#fdfbf7]/40 mb-1">Origin</h4>
                            <p>{activeView.pigment.origin}</p>
                        </div>
                        <div>
                             <h4 className="text-xs uppercase tracking-wider text-[#fdfbf7]/40 mb-1">Color Hex</h4>
                             <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: activeView.pigment.hex }} />
                                <code className="font-mono text-sm">{activeView.pigment.hex}</code>
                                <button 
                                    onClick={() => handleCopyHex(activeView.pigment.hex)}
                                    className="p-1.5 hover:bg-white/10 rounded-md transition-colors group/copy"
                                    title="Copy Hex Code"
                                >
                                    {copiedHex === activeView.pigment.hex 
                                        ? <Check className="w-3.5 h-3.5 text-green-400" /> 
                                        : <Copy className="w-3.5 h-3.5 text-[#fdfbf7]/40 group-hover/copy:text-[#d4af37]" />
                                    }
                                </button>
                             </div>
                        </div>
                    </div>

                    <div className="mt-auto pt-8 border-t border-[#ffffff]/10">
                        <p className="text-xs text-[#fdfbf7]/40 leading-relaxed">
                            {activeView.mode === '3d' 
                                ? '*This is an AI-generated 3D representation based on historical archives.'
                                : '*Scientific illustration generated based on historical descriptions.'
                            }
                        </p>
                    </div>
                </div>

            </div>
        </div>
      )}

    </div>
  );
};