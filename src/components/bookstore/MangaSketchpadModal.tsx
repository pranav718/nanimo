'use client';

import { useBookstoreStore } from '@/store/bookstoreStore';
import { useCallback, useEffect, useRef, useState } from 'react';

type DrawTool = 'pen' | 'brush' | 'screentone' | 'eraser';

export default function MangaSketchpadModal() {
    const { isSketchpadOpen, setSketchpadOpen } = useBookstoreStore();
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isDrawing, setIsDrawing] = useState<boolean>(false);
    const [tool, setTool] = useState<DrawTool>('pen');
    const [brushSize, setBrushSize] = useState<number>(3);
    const [color, setColor] = useState<string>('#09090b');
    const [lastPos, setLastPos] = useState<{ x: number; y: number } | null>(null);

    const handleClose = useCallback(() => {
        setSketchpadOpen(false);
    }, [setSketchpadOpen]);

    useEffect(() => {
        if (!isSketchpadOpen || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.fillStyle = '#f8fafc';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }, [isSketchpadOpen]);

    const getCanvasPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!canvasRef.current) return { x: 0, y: 0 };
        const rect = canvasRef.current.getBoundingClientRect();
        const scaleX = canvasRef.current.width / rect.width;
        const scaleY = canvasRef.current.height / rect.height;

        if ('touches' in e) {
            const touch = e.touches[0] || e.changedTouches[0];
            return {
                x: (touch.clientX - rect.left) * scaleX,
                y: (touch.clientY - rect.top) * scaleY,
            };
        }
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY,
        };
    };

    const startDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        setIsDrawing(true);
        const pos = getCanvasPos(e);
        setLastPos(pos);
        draw(e);
    };

    const endDraw = () => {
        setIsDrawing(false);
        setLastPos(null);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawing && e.type !== 'mousedown' && e.type !== 'touchstart') return;
        if (!canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        const currentPos = getCanvasPos(e);

        if (tool === 'screentone') {
            const patternCanvas = document.createElement('canvas');
            patternCanvas.width = 6;
            patternCanvas.height = 6;
            const pCtx = patternCanvas.getContext('2d');
            if (pCtx) {
                pCtx.fillStyle = '#f8fafc';
                pCtx.fillRect(0, 0, 6, 6);
                pCtx.fillStyle = color;
                pCtx.beginPath();
                pCtx.arc(3, 3, 1.5, 0, Math.PI * 2);
                pCtx.fill();
            }
            const pattern = ctx.createPattern(patternCanvas, 'repeat');
            if (pattern) {
                ctx.fillStyle = pattern;
                ctx.beginPath();
                ctx.arc(currentPos.x, currentPos.y, brushSize * 3, 0, Math.PI * 2);
                ctx.fill();
            }
        } else {
            ctx.beginPath();
            ctx.strokeStyle = tool === 'eraser' ? '#f8fafc' : color;
            ctx.lineWidth = tool === 'brush' ? brushSize * 4 : tool === 'eraser' ? brushSize * 5 : brushSize;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            if (lastPos) {
                ctx.moveTo(lastPos.x, lastPos.y);
                ctx.lineTo(currentPos.x, currentPos.y);
            } else {
                ctx.moveTo(currentPos.x, currentPos.y);
                ctx.lineTo(currentPos.x, currentPos.y);
            }
            ctx.stroke();
        }

        setLastPos(currentPos);
    };

    const clearCanvas = () => {
        if (!canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
            ctx.fillStyle = '#f8fafc';
            ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
    };

    const downloadSketch = () => {
        if (!canvasRef.current) return;
        const link = document.createElement('a');
        link.download = 'nanimo-manga-sketch.png';
        link.href = canvasRef.current.toDataURL('image/png');
        link.click();
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isSketchpadOpen) {
                handleClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isSketchpadOpen, handleClose]);

    if (!isSketchpadOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6 backdrop-blur-2xl animate-in fade-in duration-200 select-none">
            <div className="relative flex flex-col w-full max-w-4xl max-h-[90vh] rounded-3xl border border-amber-500/30 bg-gradient-to-b from-[#181412]/95 to-[#080706]/95 p-6 shadow-2xl backdrop-blur-2xl">
                <button
                    onClick={handleClose}
                    className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all"
                >
                    ✕
                </button>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 mb-4 gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="rounded-full bg-amber-400/20 border border-amber-400/40 px-3 py-0.5 text-xs font-bold text-amber-300 uppercase tracking-widest">
                                Manga Studio
                            </span>
                            <span className="text-xs font-mono text-white/50">
                                1F Drafting Desk
                            </span>
                        </div>
                        <h2 className="text-xl font-bold text-white tracking-tight mt-1">
                            Manga Artist Sketchpad
                        </h2>
                    </div>

                    <div className="flex items-center gap-2 mr-8 flex-wrap">
                        {(['pen', 'brush', 'screentone', 'eraser'] as const).map((t) => (
                            <button
                                key={t}
                                onClick={() => setTool(t)}
                                className={`rounded-xl px-3 py-1.5 text-xs font-bold uppercase transition-all ${
                                    tool === t
                                        ? 'bg-amber-400 text-black shadow-md'
                                        : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
                                }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-4 items-center flex-1 min-h-0">
                    <div className="flex-1 w-full flex justify-center bg-[#090807] rounded-2xl p-3 border border-white/10 shadow-inner overflow-hidden">
                        <canvas
                            ref={canvasRef}
                            width={720}
                            height={460}
                            onMouseDown={startDraw}
                            onMouseMove={draw}
                            onMouseUp={endDraw}
                            onMouseLeave={endDraw}
                            onTouchStart={startDraw}
                            onTouchMove={draw}
                            onTouchEnd={endDraw}
                            className="bg-white rounded-xl shadow-2xl max-w-full cursor-crosshair touch-none"
                        />
                    </div>

                    <div className="flex lg:flex-col items-center gap-3 w-full lg:w-48 bg-white/5 p-4 rounded-2xl border border-white/10">
                        <div className="w-full">
                            <label className="text-[10px] text-white/50 uppercase font-bold tracking-wider block mb-1">
                                Size: {brushSize}px
                            </label>
                            <input
                                type="range"
                                min={1}
                                max={30}
                                value={brushSize}
                                onChange={(e) => setBrushSize(parseInt(e.target.value, 10))}
                                className="w-full accent-amber-400 cursor-pointer"
                            />
                        </div>

                        <div className="w-full">
                            <label className="text-[10px] text-white/50 uppercase font-bold tracking-wider block mb-2">
                                Ink Palette
                            </label>
                            <div className="flex gap-2">
                                {['#09090b', '#dc2626', '#2563eb', '#78350f', '#e2e8f0'].map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => setColor(c)}
                                        style={{ backgroundColor: c }}
                                        className={`h-6 w-6 rounded-full border transition-transform ${
                                            color === c ? 'border-white scale-125' : 'border-transparent'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={clearCanvas}
                            className="w-full py-2 rounded-xl border border-white/15 bg-white/5 text-white/70 hover:bg-white/10 text-xs font-bold uppercase transition-all"
                        >
                            Clear
                        </button>

                        <button
                            onClick={downloadSketch}
                            className="w-full py-2 rounded-xl bg-amber-400 text-black text-xs font-bold uppercase tracking-wider shadow-lg hover:bg-amber-300 transition-all"
                        >
                            Export PNG
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
