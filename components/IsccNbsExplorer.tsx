import React, { useState, useRef, useEffect } from 'react';
import { ISCC_SAMPLES } from '../constants';
import { getIsccVisualization, getIscc3DModel } from '../services/geminiService';
import { IsccEntry } from '../types';
import { 
  Filter, Tag, Loader2, Maximize2, X, ZoomIn, ZoomOut, 
  RotateCcw, RotateCw, RefreshCcw, MousePointer2, Box, 
  Hexagon, Sparkles, Image as ImageIcon, Copy, Check 
} from 'lucide-react';

const CATEGORY_COLORS: Record<string, string> = {
  'Pink': '#F48FB1',
  'Red': '#D32F2F',
  'Orange': '#F57C00',
  'Brown': '#795548',
  'Yellow': '#FBC02D',
  'Olive': '#827717',
  'Green': '#388E3C',
  'Blue': '#1976D2',
  'Purple': '#7B1FA2',
  'White': '#F5F5F5',
  'Gray': '#9E9E9E',
  'Black': '#212121',
};

const CATEGORIES = ['All', 'Pink', 'Red', 'Orange', 'Brown', 'Yellow', 'Olive', 'Green', 'Blue', 'Purple', 'White', 'Gray', 'Black'];

export const IsccNbsExplorer: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  
  // --- Viewer State ---
  const [images, setImages] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState<Record<number, boolean>>({});
  const [activeView, setActiveView] = useState<{ entry: IsccEntry; mode: '2d' | '3d' } | null>(null);
  
  // 3D Specific
  const [modelImages, setModelImages] = useState<Record<string, string>>({}); // Key: "id-sphere" or "id-cube"
  const [loadingModel, setLoadingModel] = useState(false);
  const [shapeMode, setShapeMode] = useState<'sphere' | 'cube'>('sphere');
  
  // Transform State
  const [transform, setTransform] = useState({ scale: 1, rotate: 0, x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const lastTouchRef = useRef<{ x: number; y: number } | null>(null);
  const lastDistRef = useRef<number | null>(null);

  const filteredSamples = activeCategory === 'All' 
    ? ISCC_SAMPLES 
    : ISCC_SAMPLES.filter(s => s.category === activeCategory);

  useEffect(() => {
    setTransform({ scale: 1, rotate: 0, x: 0, y: 0 });
  }, [activeView]);

  const handleCopyHex = (e: React.MouseEvent, hex: string, id: number) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hex);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCardClick = async (entry: IsccEntry) => {
    if (loading[entry.id]) return;

    if (images[entry.id]) {
        setActiveView({ entry, mode: '2d' });
        return;
    }

    setLoading(prev => ({ ...prev, [entry.id]: true }));
    const imageUrl = await getIsccVisualization(entry.name, entry.hex);
    if (imageUrl) {
        setImages(prev => ({ ...prev, [entry.id]: imageUrl }));
    }
    setLoading(prev => ({ ...prev, [entry.id]: false }));
  };

  const handleOpen3D = async (e: React.MouseEvent, entry: IsccEntry) => {
    e.stopPropagation();
    setActiveView({ entry, mode: '3d' });
    setShapeMode('sphere');

    const key = `${entry.id}-sphere`;
    if (!modelImages[key]) {
      setLoadingModel(true);
      const img = await getIscc3DModel(entry.name, entry.hex, 'sphere');
      if (img) {
        setModelImages(prev => ({ ...prev, [key]: img }));
      }
      setLoadingModel(false);
    }
  };

  const toggleShapeMode = async () => {
    if (!activeView || activeView.mode !== '3d') return;
    
    const newMode = shapeMode === 'sphere' ? 'cube' : 'sphere';
    setShapeMode(newMode);
    
    const key = `${activeView.entry.id}-${newMode}`;
    if (!modelImages[key]) {
        setLoadingModel(true);
        const img = await getIscc3DModel(activeView.entry.name, activeView.entry.hex, newMode);
        if (img) {
            setModelImages(prev => ({ ...prev, [key]: img }));
        }
        setLoadingModel(false);
    }
  };

  const closeViewer = () => setActiveView(null);

  // --- Interaction Handlers (Shared with Cabinet) ---
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

  // Helper
  const currentImage = activeView?.mode === '3d' 
    ? modelImages[`${activeView.entry.id}-${shapeMode}`] 
    : (activeView ? images[activeView.entry.id] : null);
  const isLoadingViewer = activeView?.mode === '3d' ? loadingModel : false;


  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-stone-50 relative">
      <div className="max-w-6xl w-full">
        
        <div className="text-center mb-12">
            <h2 className="font-serif text-4xl text-ink mb-4">Exhibit IV: The Standardized World</h2>
            <p className="text-ink-light max-w-2xl mx-auto mb-6">
                In 1939, the ISCC-NBS system attempted to solve the ambiguity of color language by defining 267 "centroids".
                <br/>
                <span className="text-xs text-stone-400 mt-2 block italic">Click any card to visualize the material reality of these abstract standards.</span>
            </p>
            <div className="w-24 h-px bg-ink/10 mx-auto" />
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap justify-center gap-2 mb-10 max-w-4xl mx-auto">
            {CATEGORIES.map(cat => (
                <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`pl-3 pr-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all flex items-center gap-2 ${
                        activeCategory === cat
                        ? 'bg-ink text-white border-ink shadow-md transform scale-105'
                        : 'bg-white text-ink-light border-stone-200 hover:border-stone-400 hover:bg-stone-50'
                    }`}
                >
                    {cat !== 'All' && (
                        <span 
                            className="w-3 h-3 rounded-full border border-black/10 shadow-sm"
                            style={{ backgroundColor: CATEGORY_COLORS[cat] }} 
                        />
                    )}
                    {cat}
                </button>
            ))}
        </div>

        {/* Catalog Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
            {filteredSamples.map((item) => {
                const isLoading = loading[item.id];
                const hasImage = !!images[item.id];

                return (
                    <div 
                        key={item.id}
                        onClick={() => handleCardClick(item)}
                        className="bg-white p-3 rounded-lg shadow-sm border border-stone-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer relative"
                    >
                        <div 
                            className="aspect-square w-full rounded-md mb-3 relative overflow-hidden shadow-inner bg-stone-100"
                        >
                            {/* Color Block / Image */}
                             {hasImage ? (
                                <img 
                                    src={images[item.id]} 
                                    alt={item.name}
                                    className="w-full h-full object-cover animate-in fade-in duration-500"
                                />
                             ) : (
                                <div className="w-full h-full" style={{ backgroundColor: item.hex }} />
                             )}

                             {/* Hover Overlay */}
                             <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                {!hasImage && !isLoading && (
                                    <span className="text-white text-[10px] uppercase font-bold tracking-wider border border-white/50 px-2 py-1 rounded-full backdrop-blur-sm">Visualize</span>
                                )}
                                {hasImage && (
                                    <Maximize2 className="text-white w-6 h-6 drop-shadow-md" />
                                )}
                             </div>

                             {/* Loading Spinner */}
                             {isLoading && (
                                <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                                    <Loader2 className="w-6 h-6 text-ink animate-spin" />
                                </div>
                             )}
                        </div>
                        
                        <div className="flex justify-between items-start mb-1">
                            <span className="font-mono text-[10px] text-stone-400">No. {item.id}</span>
                            {/* 3D Button - Mini */}
                            <button
                                onClick={(e) => handleOpen3D(e, item)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-ink text-white rounded-full hover:bg-accent-gold hover:text-ink hover:scale-110"
                                title="View 3D Model"
                            >
                                <Box className="w-3 h-3" />
                            </button>
                        </div>
                        
                        <h3 className="font-serif text-sm text-ink leading-tight min-h-[2.5em] flex items-center">
                            {item.name}
                        </h3>
                        
                        <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-400">
                            <div className="flex items-center gap-1">
                                <Tag className="w-3 h-3" />
                                {item.category}
                            </div>
                            <button 
                                onClick={(e) => handleCopyHex(e, item.hex, item.id)}
                                className="flex items-center gap-1.5 hover:text-ink hover:bg-stone-100 px-2 py-1 rounded transition-colors z-20"
                                title="Copy Hex"
                            >
                                <span className="font-mono uppercase font-medium">{item.hex}</span>
                                {copiedId === item.id 
                                    ? <Check className="w-3 h-3 text-green-600" /> 
                                    : <Copy className="w-3 h-3" />
                                }
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>

        <div className="mt-12 bg-white p-6 rounded-xl border border-stone-200 shadow-sm flex flex-col md:flex-row items-center gap-6">
             <div className="bg-stone-100 p-4 rounded-full">
                <Filter className="w-6 h-6 text-ink" />
             </div>
             <div className="text-center md:text-left">
                <h4 className="font-bold text-ink mb-1">Why standardize?</h4>
                <p className="text-sm text-ink-light max-w-xl">
                    Before these centroids, "red" could mean anything from brick to blood. The ISCC-NBS system introduced syntax: 
                    <span className="font-mono bg-stone-100 px-1 mx-1 rounded text-ink">Tone</span> (Light/Dark) + 
                    <span className="font-mono bg-stone-100 px-1 mx-1 rounded text-ink">Saturation</span> (Vivid/Pale) + 
                    <span className="font-mono bg-stone-100 px-1 mx-1 rounded text-ink">Hue</span> (Red/Blue).
                </p>
             </div>
        </div>

      </div>

      {/* --- VIEWER MODAL --- */}
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

                {/* Left: Viewport */}
                <div className="w-full md:w-3/4 bg-gradient-to-br from-[#2a2622] to-[#000] relative flex items-center justify-center overflow-hidden group">
                    <div className="absolute inset-0 opacity-10 pointer-events-none" 
                        style={{ backgroundImage: 'linear-gradient(#d4af37 1px, transparent 1px), linear-gradient(90deg, #d4af37 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
                    />

                    {isLoadingViewer ? (
                         <div className="flex flex-col items-center gap-4 z-10">
                            <Loader2 className="w-12 h-12 text-[#d4af37] animate-spin" />
                            <p className="text-[#d4af37] text-sm font-mono animate-pulse">
                                {activeView.mode === '3d' ? 'RENDERING 3D MODEL...' : 'LOADING VISUALIZATION...'}
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
                                
                                <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
                                     <div className="bg-black/60 px-3 py-1 rounded text-xs text-white/70 font-mono flex items-center gap-2 backdrop-blur-sm border border-white/5">
                                        <MousePointer2 className="w-3 h-3" />
                                        Pan: Drag
                                    </div>
                                    <div className="bg-[#d4af37]/20 text-[#d4af37] px-3 py-1 rounded text-xs font-mono backdrop-blur-sm border border-[#d4af37]/30">
                                        {activeView.mode === '3d' ? '3D MODEL' : '2D VIEW'} | Scale: {transform.scale.toFixed(1)}x
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
                                    
                                    {activeView.mode === '3d' && (
                                        <>
                                            <div className="w-px h-4 bg-white/10" />
                                            <button onClick={toggleShapeMode} className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/10 rounded-lg text-white/70 hover:text-[#d4af37] text-xs font-bold uppercase tracking-wider min-w-[100px] justify-center">
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

                {/* Right: Info Panel */}
                <div className="w-full md:w-1/4 p-8 border-l border-[#ffffff]/5 flex flex-col bg-[#2d2a26] overflow-y-auto">
                    <div className="mb-2">
                        <span className="text-[#d4af37] text-xs font-bold uppercase tracking-[0.2em]">ISCC-NBS Centroid</span>
                    </div>
                    <h3 className="font-serif text-3xl text-white mb-6 leading-tight">{activeView.entry.name}</h3>
                    
                    <div className="space-y-6 text-[#fdfbf7]/80">
                         <div>
                             <h4 className="text-xs uppercase tracking-wider text-[#fdfbf7]/40 mb-1">Standard Number</h4>
                             <p className="font-mono text-xl">{activeView.entry.id}</p>
                        </div>
                        <div>
                             <h4 className="text-xs uppercase tracking-wider text-[#fdfbf7]/40 mb-1">Hex Reference</h4>
                             <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full border border-white/20" style={{ backgroundColor: activeView.entry.hex }} />
                                <code className="font-mono text-lg">{activeView.entry.hex}</code>
                                <button 
                                    onClick={(e) => handleCopyHex(e, activeView.entry.hex, activeView.entry.id)} 
                                    className="p-1 hover:text-[#d4af37] transition-colors"
                                    title="Copy"
                                >
                                     {copiedId === activeView.entry.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </button>
                             </div>
                        </div>
                        <div>
                             <h4 className="text-xs uppercase tracking-wider text-[#fdfbf7]/40 mb-1">Visualization Context</h4>
                             <p className="font-serif italic text-sm">
                                {activeView.mode === '3d' 
                                    ? (shapeMode === 'sphere' ? "Polished ceramic reference sphere used for gloss calibration." : "Matte diffuse reference block used for flat color calibration.") 
                                    : "Material swatch representing the pure centroid hue in natural lighting."}
                             </p>
                        </div>
                    </div>

                    <div className="mt-auto pt-8 border-t border-[#ffffff]/10">
                        <p className="text-xs text-[#fdfbf7]/40 leading-relaxed">
                            *AI-generated visualization based on ISCC-NBS colorimetric data.
                        </p>
                    </div>
                </div>

            </div>
        </div>
      )}
    </div>
  );
};