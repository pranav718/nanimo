'use client';

import { useBookstoreStore } from '@/store/bookstoreStore';
import { useCallback, useEffect, useState } from 'react';

export default function GachaponModal() {
    const {
        isGachaponOpen,
        setGachaponOpen,
        gachaponResult,
        rollGachapon,
        setInspectedMedia,
        toggleSaveMedia,
        isMediaSaved,
    } = useBookstoreStore();

    const [isPopping, setIsPopping] = useState(true);

    const handleClose = useCallback(() => {
        setGachaponOpen(false);
    }, [setGachaponOpen]);

    const handleReroll = () => {
        setIsPopping(true);
        setTimeout(() => {
            rollGachapon();
            setIsPopping(false);
        }, 400);
    };

    useEffect(() => {
        if (isGachaponOpen) {
            setIsPopping(true);
            const timer = setTimeout(() => setIsPopping(false), 500);
            return () => clearTimeout(timer);
        }
    }, [isGachaponOpen]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                handleClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleClose]);

    if (!isGachaponOpen || !gachaponResult) return null;

    const title = gachaponResult.title.english || gachaponResult.title.romaji || 'Mystery Volume';
    const isSaved = isMediaSaved(gachaponResult.id);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6 backdrop-blur-2xl animate-in fade-in duration-200">
            <div className="relative flex flex-col items-center w-full max-w-lg rounded-3xl border border-rose-500/30 bg-gradient-to-b from-[#2a0e18]/95 to-[#0a0508]/95 p-8 shadow-2xl backdrop-blur-2xl text-center overflow-hidden">
                <button
                    onClick={handleClose}
                    className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all"
                >
                    ✕
                </button>

                <div className="mb-2">
                    <span className="rounded-full border border-rose-400/40 bg-rose-500/20 px-4 py-1 text-xs font-bold tracking-widest text-rose-300 uppercase animate-pulse">
                        Gachapon Mystery Drop
                    </span>
                </div>

                <div className={`relative my-6 transition-all duration-500 ${isPopping ? 'scale-50 rotate-45 opacity-0' : 'scale-100 rotate-0 opacity-100'}`}>
                    <div
                        className="h-64 w-44 rounded-2xl bg-cover bg-center shadow-2xl border-2 border-rose-400/40 mx-auto"
                        style={{
                            backgroundImage: `url(${gachaponResult.coverImage.extraLarge || gachaponResult.coverImage.large})`,
                        }}
                    />
                    <div className="absolute -inset-4 bg-radial from-rose-500/20 via-transparent to-transparent rounded-full -z-10 animate-ping opacity-30" />
                </div>

                <h3 className="text-2xl font-bold tracking-tight text-white mb-1">
                    {title}
                </h3>

                <div className="flex items-center justify-center gap-2 mb-4">
                    <span className="text-xs font-semibold text-amber-300">
                        Score: {gachaponResult.averageScore ? `${gachaponResult.averageScore}%` : 'N/A'}
                    </span>
                    <span className="text-white/30">•</span>
                    <span className="text-xs text-white/60">
                        {gachaponResult.genres.slice(0, 3).join(', ')}
                    </span>
                </div>

                <p className="text-xs text-white/70 line-clamp-3 mb-6 leading-relaxed">
                    {gachaponResult.description?.replace(/<[^>]*>?/gm, '') || 'No synopsis.'}
                </p>

                <div className="flex flex-col w-full gap-2.5">
                    <button
                        onClick={() => {
                            setInspectedMedia(gachaponResult);
                            handleClose();
                        }}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold uppercase tracking-wider text-xs shadow-lg hover:from-rose-400 hover:to-pink-500 transition-all"
                    >
                        Inspect Full Volume
                    </button>

                    <div className="flex gap-2">
                        <button
                            onClick={() => toggleSaveMedia(gachaponResult)}
                            className={`flex-1 py-2.5 rounded-xl border text-xs font-semibold uppercase tracking-wider transition-all ${
                                isSaved
                                    ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                                    : 'bg-white/5 border-white/15 text-white/80 hover:bg-white/10'
                            }`}
                        >
                            {isSaved ? 'Saved to Shelf' : 'Save to My Shelf'}
                        </button>
                        <button
                            onClick={handleReroll}
                            className="flex-1 py-2.5 rounded-xl border border-white/15 bg-white/5 text-white/80 hover:bg-white/10 text-xs font-semibold uppercase tracking-wider transition-all"
                        >
                            Roll Again
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
