'use client';

import { useBookstoreStore } from '@/store/bookstoreStore';
import { useCallback, useEffect, useState } from 'react';

export default function PhotoModeModal() {
    const { isPhotoMode, setPhotoMode } = useBookstoreStore();
    const [selectedFilter, setSelectedFilter] = useState('none');
    const [isFlashing, setIsFlashing] = useState(false);

    const handleClose = useCallback(() => {
        setPhotoMode(false);
    }, [setPhotoMode]);

    const handleCapture = () => {
        setIsFlashing(true);
        setTimeout(() => setIsFlashing(false), 250);

        const canvas = document.querySelector('canvas');
        if (!canvas) return;

        try {
            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `nanimo-3d-${Date.now()}.png`;
            link.href = dataUrl;
            link.click();
        } catch {}
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isPhotoMode) {
                handleClose();
            } else if ((e.key === 'p' || e.key === 'P') && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
                setPhotoMode(!isPhotoMode);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPhotoMode, handleClose, setPhotoMode]);

    if (!isPhotoMode) return null;

    const filters = [
        { id: 'none', label: 'Natural', css: 'none' },
        { id: 'cyber', label: 'Cyber Neon', css: 'contrast(130%) saturate(160%) hue-rotate(20deg)' },
        { id: 'vintage', label: 'Vintage Anime', css: 'sepia(40%) contrast(110%) brightness(95%)' },
        { id: 'sakura', label: 'Sakura Dream', css: 'brightness(110%) saturate(140%) hue-rotate(-15deg)' },
        { id: 'mono', label: 'Manga Noir', css: 'grayscale(100%) contrast(160%)' },
    ];

    const currentCss = filters.find((f) => f.id === selectedFilter)?.css || 'none';

    return (
        <div className="fixed inset-0 z-50 pointer-events-none select-none flex flex-col justify-between p-6 md:p-8">
            <div
                className="fixed inset-0 pointer-events-none transition-all duration-300"
                style={{ backdropFilter: currentCss !== 'none' ? currentCss : undefined }}
            />

            {isFlashing && (
                <div className="fixed inset-0 z-50 bg-white pointer-events-none animate-out fade-out duration-200" />
            )}

            <div className="pointer-events-auto flex items-center justify-between">
                <div className="flex items-center gap-2 rounded-full border border-white/20 bg-black/70 px-4 py-2 backdrop-blur-md">
                    <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                    <span className="text-xs font-bold uppercase tracking-widest text-white">
                        Photo Studio Mode
                    </span>
                </div>

                <button
                    onClick={handleClose}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/70 text-white hover:bg-white/20 transition-all backdrop-blur-md"
                >
                    ✕
                </button>
            </div>

            <div className="absolute inset-x-12 inset-y-24 border border-white/10 pointer-events-none flex flex-col justify-between">
                <div className="h-1/3 border-b border-white/5" />
                <div className="h-1/3 border-b border-white/5" />
                <div className="absolute inset-0 flex justify-between pointer-events-none">
                    <div className="w-1/3 border-r border-white/5" />
                    <div className="w-1/3 border-r border-white/5" />
                </div>
            </div>

            <div className="pointer-events-auto flex flex-col items-center gap-4">
                <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/80 p-1.5 backdrop-blur-xl">
                    {filters.map((f) => (
                        <button
                            key={f.id}
                            onClick={() => setSelectedFilter(f.id)}
                            className={`rounded-full px-3.5 py-1 text-xs font-semibold tracking-wider transition-all ${
                                selectedFilter === f.id
                                    ? 'bg-amber-400 text-black shadow-md'
                                    : 'text-white/60 hover:text-white'
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={handleCapture}
                        className="flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-8 py-3 text-xs font-bold uppercase tracking-widest text-black shadow-2xl hover:scale-105 transition-all"
                    >
                        <span>Capture Snapshot</span>
                    </button>
                    <button
                        onClick={handleClose}
                        className="rounded-full border border-white/20 bg-black/80 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white/80 hover:bg-white/10 transition-all backdrop-blur-md"
                    >
                        Exit (P / ESC)
                    </button>
                </div>
            </div>
        </div>
    );
}
