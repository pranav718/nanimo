'use client';

import { useBookstoreStore } from '@/store/bookstoreStore';
import { useCallback, useEffect } from 'react';

export default function BookstoreHUD() {
    const {
        currentFloor,
        setCurrentFloor,
        proximityTarget,
        isLoading,
        isAudioPlaying,
        toggleAudio,
        setFastTravelOpen,
        isHelpOpen,
        setHelpOpen,
        setWardrobeOpen,
        setSearchOpen,
    } = useBookstoreStore();

    const floorNames: Record<number, { en: string; jp: string }> = {
        1: { en: 'Manga Sanctuary', jp: '漫画フロア' },
        2: { en: 'Anime Screening Lounge', jp: 'アニメシアター' },
        3: { en: 'Starlit Rooftop Observatory', jp: '屋上展望台' },
    };

    const current = floorNames[currentFloor] || floorNames[1];

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
        if (e.key === 'm' || e.key === 'M') {
            setFastTravelOpen(true);
        } else if (e.key === 'c' || e.key === 'C') {
            setWardrobeOpen(true);
        } else if (e.key === 'h' || e.key === 'H' || e.key === '?') {
            setHelpOpen(!isHelpOpen);
        }
    }, [setFastTravelOpen, setWardrobeOpen, setHelpOpen, isHelpOpen]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return (
        <>
            <div className="pointer-events-none fixed inset-0 z-20 flex flex-col justify-between p-6 md:p-8">
                <div className="flex items-start justify-between">
                    <div className="pointer-events-auto flex flex-col">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white/95">
                                何も
                            </h1>
                            <div className="flex items-center rounded-full border border-white/20 bg-black/60 p-0.5 backdrop-blur-md">
                                <button
                                    onClick={() => setCurrentFloor(1)}
                                    className={`rounded-full px-3 py-0.5 text-xs font-semibold tracking-wider transition-all ${
                                        currentFloor === 1
                                            ? 'bg-amber-400 text-black shadow-md'
                                            : 'text-white/60 hover:text-white'
                                    }`}
                                >
                                    1F Manga
                                </button>
                                <button
                                    onClick={() => setCurrentFloor(2)}
                                    className={`rounded-full px-3 py-0.5 text-xs font-semibold tracking-wider transition-all ${
                                        currentFloor === 2
                                            ? 'bg-sky-400 text-black shadow-md'
                                            : 'text-white/60 hover:text-white'
                                    }`}
                                >
                                    2F Anime
                                </button>
                                <button
                                    onClick={() => setCurrentFloor(3)}
                                    className={`rounded-full px-3 py-0.5 text-xs font-semibold tracking-wider transition-all ${
                                        currentFloor === 3
                                            ? 'bg-pink-400 text-black shadow-md'
                                            : 'text-white/60 hover:text-white'
                                    }`}
                                >
                                    3F Rooftop
                                </button>
                            </div>
                        </div>
                        <p className="mt-1.5 text-xs tracking-widest text-white/50 uppercase">
                            {current.en} • {current.jp}
                        </p>
                    </div>

                    <div className="pointer-events-auto flex items-center gap-2 mr-40">
                        <button
                            onClick={() => setSearchOpen(true)}
                            className="hidden sm:flex items-center gap-1.5 rounded-full border border-white/15 bg-black/50 px-3 py-1.5 text-xs font-semibold tracking-wider text-white/80 hover:bg-white/10 hover:text-white transition-all backdrop-blur-md"
                        >
                            <span>Search</span>
                            <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/60">⌘K</kbd>
                        </button>

                        <button
                            onClick={() => setWardrobeOpen(true)}
                            className="flex items-center gap-1.5 rounded-full border border-white/15 bg-black/50 px-3 py-1.5 text-xs font-semibold tracking-wider text-white/80 hover:bg-white/10 hover:text-white transition-all backdrop-blur-md"
                        >
                            <span>Wardrobe</span>
                            <kbd className="hidden sm:inline-block rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/60">C</kbd>
                        </button>

                        <button
                            onClick={toggleAudio}
                            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold tracking-wider transition-all backdrop-blur-md ${
                                isAudioPlaying
                                    ? 'border-amber-400/60 bg-amber-400/20 text-amber-300 shadow-lg shadow-amber-400/10'
                                    : 'border-white/15 bg-black/50 text-white/60 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            <span>Audio:</span>
                            <span>{isAudioPlaying ? 'ON' : 'OFF'}</span>
                        </button>

                        <button
                            onClick={() => setFastTravelOpen(true)}
                            className="hidden sm:flex items-center gap-1.5 rounded-full border border-white/15 bg-black/50 px-3 py-1.5 text-xs font-semibold tracking-wider text-white/80 hover:bg-white/10 hover:text-white transition-all backdrop-blur-md"
                        >
                            <span>Map</span>
                            <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/60">M</kbd>
                        </button>

                        <button
                            onClick={() => setHelpOpen(true)}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/50 text-xs font-bold text-white/80 hover:bg-white/10 hover:text-white transition-all backdrop-blur-md"
                        >
                            ?
                        </button>
                    </div>
                </div>

                {isLoading && (
                    <div className="self-center rounded-full border border-white/20 bg-black/70 px-5 py-2 text-xs font-medium tracking-widest text-white/80 backdrop-blur-md animate-pulse">
                        Loading Archive...
                    </div>
                )}

                {proximityTarget && (
                    <div className="self-center animate-bounce mb-4">
                        <div className="flex items-center gap-3 rounded-full border border-amber-400/50 bg-black/85 px-6 py-2.5 shadow-2xl backdrop-blur-md">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-xs font-black text-black">
                                E
                            </span>
                            <span className="text-sm font-semibold tracking-wide text-white">
                                {proximityTarget.type === 'elevator'
                                    ? `Step into Glass Elevator (Currently ${currentFloor}F)`
                                    : `Inspect ${proximityTarget.name}`}
                            </span>
                        </div>
                    </div>
                )}

                <div className="hidden md:flex items-center justify-between text-[11px] tracking-wider text-white/40">
                    <div className="flex items-center gap-4 rounded-full border border-white/10 bg-black/50 px-4 py-1.5 backdrop-blur-md">
                        <span>WASD to Move</span>
                        <span>•</span>
                        <span>Shift to Sprint</span>
                        <span>•</span>
                        <span>Space to Jump</span>
                        <span>•</span>
                        <span>Drag to Look</span>
                        <span>•</span>
                        <span>Click Volume to Inspect</span>
                        <span>•</span>
                        <span>C for Wardrobe</span>
                    </div>
                    <div className="rounded-full border border-white/10 bg-black/50 px-3 py-1.5 backdrop-blur-md font-mono text-[10px]">
                        NANIMO 3D SPATIAL ARCHIVE
                    </div>
                </div>
            </div>

            {isHelpOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 backdrop-blur-2xl animate-in fade-in duration-200">
                    <div className="relative flex flex-col w-full max-w-lg rounded-3xl border border-white/15 bg-gradient-to-b from-[#181412] to-[#0a0808] p-8 shadow-2xl backdrop-blur-2xl">
                        <button
                            onClick={() => setHelpOpen(false)}
                            className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all"
                        >
                            ✕
                        </button>

                        <h2 className="text-2xl font-bold tracking-tight text-white mb-1">
                            Navigation Guide
                        </h2>
                        <p className="text-xs text-white/40 tracking-wider uppercase mb-6">
                            How to Explore Nanimo Bookstore
                        </p>

                        <div className="flex flex-col gap-3 text-xs">
                            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                                <span className="text-white/80 font-medium">Movement</span>
                                <span className="font-mono text-amber-300">W, A, S, D / Arrow Keys</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                                <span className="text-white/80 font-medium">Sprint / Run</span>
                                <span className="font-mono text-amber-300">Shift</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                                <span className="text-white/80 font-medium">Jump</span>
                                <span className="font-mono text-amber-300">Spacebar</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                                <span className="text-white/80 font-medium">Camera Orbit</span>
                                <span className="font-mono text-amber-300">Mouse Drag</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                                <span className="text-white/80 font-medium">Inspect Volume / Elevator</span>
                                <span className="font-mono text-amber-300">E / Left Click</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                                <span className="text-white/80 font-medium">Avatar Wardrobe</span>
                                <span className="font-mono text-amber-300">C</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                                <span className="text-white/80 font-medium">Instant Search</span>
                                <span className="font-mono text-amber-300">⌘K / /</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                                <span className="text-white/80 font-medium">Fast Travel Directory</span>
                                <span className="font-mono text-amber-300">M</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setHelpOpen(false)}
                            className="mt-6 w-full py-3 rounded-xl bg-amber-400 text-black font-bold uppercase tracking-wider text-xs shadow-lg hover:bg-amber-300 transition-all"
                        >
                            Got It
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
