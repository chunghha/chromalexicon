import React, { useState, useEffect, useRef } from 'react';
import { ISCC_SAMPLES } from '../constants';
import { getIsccVisualization, getIscc3DModel } from '../services/geminiService';
import { IsccEntry } from '../types';
import {
  Loader2, X, ZoomIn, ZoomOut, RotateCcw, RotateCw, RefreshCcw,
  MousePointer2, Box, Hexagon, Sparkles, Image as ImageIcon,
  Copy, Check, Dices
} from 'lucide-react';

export const ColorRealityFooter: React.FC = () => {
  const [color, setColor] = useState<IsccEntry | null>(null);
  const [copied, setCopied] = useState(false);

  // Visuals Cache
  const [visualUrl, setVisualUrl] = useState<string | null>(null);
  const [cachedModels, setCachedModels] = useState<Record<string, string>>({});

  // View State
  const [viewMode, setViewMode] = useState<'none' | '2d' | '3d'>('none');
  const [loading, setLoading] = useState(false);
  const [shapeMode, setShapeMode] = useState<'sphere' | 'cube'>('sphere');

  // Transform State
  const [transform, setTransform] = useState({ scale: 1, rotate: 0, x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const lastTouchRef = useRef<{ x: number; y: number } | null>(null);
  const lastDistRef = useRef<number | null>(null);

  useEffect(() => {
    randomize();
  }, []);

  // Reset transform when view changes
  useEffect(() => {
    setTransform({ scale: 1, rotate: 0, x: 0, y: 0 });
  }, [viewMode]);

  const randomize = () => {
    const random = ISCC_SAMPLES[Math.floor(Math.random() * ISCC_SAMPLES.length)];
    setColor(random);
    setVisualUrl(null);
    setCachedModels({});
    setLoading(false);
    setViewMode('none');
  };

  const handleCopy = () => {
    if (!color) return;
    navigator.clipboard.writeText(color.hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVisualize = async () => {
    if (!color) return;
    if (visualUrl) {
       setViewMode('2d');
       return;
    }

    setLoading(true);
    const url = await getIsccVisualization(color.name, color.hex);
    if (url) setVisualUrl(url);
    setLoading(false);
    if (url) setViewMode('2d');
  };

  const handle3D = async () => {
    if (!color) return;
    setViewMode('3d');
    setShapeMode('sphere');

    if (cachedModels['sphere']) {
         return; // already cached
    }

    setLoading(true);
    const url = await getIscc3DModel(color.name, color.hex, 'sphere');
    if (url) setCachedModels(prev => ({...prev, sphere: url}));
    setLoading(false);
  };

  const toggleShape = async () => {
     if (!color) return;
     const newShape = shapeMode === 'sphere' ? 'cube' : 'sphere';
     setShapeMode(newShape);

     if (!cachedModels[newShape]) {
         setLoading(true);
         const url = await getIscc3DModel(color.name, color.hex, newShape);
         if (url) setCachedModels(prev => ({...prev, [newShape]: url}));
         setLoading(false);
     }
  };

  const closeViewer = () => setViewMode('none');

  // --- Transform Handlers ---
  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    const scaleAdjustment = -e.deltaY * 0.001;
    setTransform(prev => ({ ...prev, scale: Math.min(Math.max(prev.scale + scaleAdjustment, 0.5), 5) }));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = { x: e.clientX - transform.x, y: e.clientY - transform.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    setTransform(prev => ({ ...prev, x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y }));
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      lastTouchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      lastDistRef.current = dist;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && lastTouchRef.current) {
        const x = e.touches[0].clientX;
        const y = e.touches[0].clientY;
        setTransform(prev => ({ ...prev, x: prev.x + (x - lastTouchRef.current!.x), y: prev.y + (y - lastTouchRef.current!.y) }));
        lastTouchRef.current = { x, y };
    } else if (e.touches.length === 2 && lastDistRef.current) {
        const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        const ratio = dist / lastDistRef.current;
        setTransform(prev => ({ ...prev, scale: Math.min(Math.max(prev.scale * ratio, 0.5), 5) }));
        lastDistRef.current = dist;
    }
  };

  const handleTouchEnd = () => { lastTouchRef.current = null; lastDistRef.current = null; };
  const resetView = () => setTransform({ scale: 1, rotate: 0, x: 0, y: 0 });
  const updateRotate = (delta: number) => setTransform(prev => ({ ...prev, rotate: prev.rotate + delta }));
  const updateScale = (delta: number) => setTransform(prev => ({ ...prev, scale: Math.min(Math.max(prev.scale + delta, 0.5), 5) }));

  // Helper for display
  const currentImage = viewMode === '2d' ? visualUrl : cachedModels[shapeMode];

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto px-4">
         <h2 className="font-serif text-4xl mb-6 text-ink">So, is color real?</h2>
         <p className="text-xl italic text-ink-light mb-10">It is now. Because we have the words for it.</p>

         {color && (
            <div className="relative group bg-white p-6 rounded-2xl shadow-xl border border-stone-100 flex flex-col items-center transition-all hover:-translate-y-2 duration-500 w-full max-w-sm">
                
                {/* Randomizer Button (Floating) */}
                <button
                    onClick={randomize}
                    className="absolute -top-4 right-4 bg-ink text-white p-2.5 rounded-full shadow-lg hover:bg-accent-gold hover:text-ink transition-colors z-20"
                    title="Random Color"
                >
                    <Dices className="w-5 h-5" />
                </button>

                {/* Color Swatch */}
                <div className="w-full aspect-square rounded-xl shadow-inner mb-6 relative overflow-hidden bg-stone-100 group-hover:shadow-md transition-shadow">
                     <div className="w-full h-full" style={{ backgroundColor: color.hex }} />
                     
                     {/* Hover Actions */}
                     <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 backdrop-blur-[2px]">
                         <button
                           onClick={handleVisualize}
                           className="bg-white hover:bg-stone-50 text-ink text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-full shadow-xl flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
                         >
                            <ImageIcon className="w-4 h-4" /> Visualize
                         </button>
                         <button
                           onClick={handle3D}
                           className="bg-white hover:bg-stone-50 text-ink text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-full shadow-xl flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75"
                         >
                            <Box className="w-4 h-4" /> 3D Model
                         </button>
                     </div>
                </div>

                <div className="text-center w-full space-y-4">
                    <h3 className="font-serif text-3xl text-ink leading-tight">{color.name}</h3>
                    
                    <div className="inline-flex items-center gap-3 bg-stone-50 px-4 py-2 rounded-lg border border-stone-100">
                        <span className="font-mono text-stone-500 font-medium">{color.hex}</span>
                        <div className="w-px h-4 bg-stone-200" />
                        <button 
                            onClick={handleCopy} 
                            className="text-stone-400 hover:text-accent-gold transition-colors flex items-center gap-1.5"
                            title="Copy Hex Code"
                        >
                            {copied 
                                ? <Check className="w-4 h-4 text-green-500" /> 
                                : <><Copy className="w-4 h-4" /> <span className="text-xs uppercase font-bold tracking-wider">Copy</span></>
                            }
                        </button>
                    </div>

                    <div className="pt-4 border-t border-stone-100 w-full flex justify-between text-xs text-stone-400 uppercase tracking-widest">
                        <span>ISCC-NBS No. {color.id}</span>
                        <span>{color.category}</span>
                    </div>
                </div>
            </div>
         )}

         {/* --- VIEWER MODAL --- */}
         {viewMode !== 'none' && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={closeViewer} />
                
                <div className="relative w-full max-w-5xl bg-[#1a1816] rounded-2xl overflow-hidden shadow-2xl border border-[#d4af37]/20 flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-300 h-[80vh]">
                    
                    <button 
                        onClick={closeViewer}
                        className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-white/20 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Viewport */}
                    <div className="w-full h-full bg-gradient-to-br from-[#2a2622] to-[#000] relative flex items-center justify-center overflow-hidden group">
                        <div className="absolute inset-0 opacity-10 pointer-events-none" 
                            style={{ backgroundImage: 'linear-gradient(#d4af37 1px, transparent 1px), linear-gradient(90deg, #d4af37 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
                        />

                        {loading ? (
                             <div className="flex flex-col items-center gap-4 z-10">
                                <Loader2 className="w-12 h-12 text-[#d4af37] animate-spin" />
                                <p className="text-[#d4af37] text-sm font-mono animate-pulse">
                                    {viewMode === '3d' ? 'RENDERING 3D MODEL...' : 'LOADING VISUALIZATION...'}
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
                                        alt="Visualization" 
                                        style={{ 
                                            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale}) rotate(${transform.rotate}deg)`,
                                            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                                        }}
                                        className="max-w-none max-h-none object-contain drop-shadow-2xl select-none" 
                                        draggable={false}
                                    />
                                    
                                    {/* Overlay Info */}
                                    <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
                                         <div className="bg-black/60 px-3 py-1 rounded text-xs text-white/70 font-mono flex items-center gap-2 backdrop-blur-sm border border-white/5">
                                            <MousePointer2 className="w-3 h-3" />
                                            Pan: Drag
                                        </div>
                                    </div>

                                    {/* Toolbar */}
                                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md rounded-2xl border border-white/10 p-3 flex flex-col md:flex-row items-center gap-4 shadow-xl z-20 min-w-max">
                                        <div className="flex items-center gap-3 bg-white/5 rounded-lg px-3 py-1.5">
                                            <button onClick={() => updateScale(-0.5)} className="p-1 hover:text-[#d4af37] text-white/70"><ZoomOut className="w-4 h-4" /></button>
                                            <input type="range" min="0.5" max="5" step="0.1" value={transform.scale} onChange={(e) => setTransform(prev => ({ ...prev, scale: parseFloat(e.target.value) }))} className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#d4af37]" />
                                            <button onClick={() => updateScale(0.5)} className="p-1 hover:text-[#d4af37] text-white/70"><ZoomIn className="w-4 h-4" /></button>
                                        </div>
                                        <div className="flex items-center gap-3 bg-white/5 rounded-lg px-3 py-1.5">
                                            <button onClick={() => updateRotate(-90)} className="p-1 hover:text-[#d4af37] text-white/70"><RotateCcw className="w-4 h-4" /></button>
                                            <button onClick={() => updateRotate(90)} className="p-1 hover:text-[#d4af37] text-white/70"><RotateCw className="w-4 h-4" /></button>
                                        </div>
                                        
                                        {viewMode === '3d' && (
                                            <>
                                                <div className="w-px h-4 bg-white/10" />
                                                <button onClick={toggleShape} className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/10 rounded-lg text-white/70 hover:text-[#d4af37] text-xs font-bold uppercase tracking-wider min-w-[100px] justify-center">
                                                    {shapeMode === 'sphere' ? <><Sparkles className="w-3.5 h-3.5" /> Glossy</> : <><Hexagon className="w-3.5 h-3.5" /> Matte</>}
                                                </button>
                                            </>
                                        )}

                                        <div className="w-full md:w-px h-px md:h-8 bg-white/10" />
                                        <button onClick={resetView} className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/10 rounded-lg text-white/70 hover:text-[#d4af37] text-xs font-bold uppercase tracking-wider"><RefreshCcw className="w-3.5 h-3.5" /> Reset</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-red-400">Failed to load content</div>
                            )
                        )}
                    </div>
                </div>
            </div>
         )}
    </div>
  );
};