'use client';

import { useBookstoreStore } from '@/store/bookstoreStore';
import { useCallback, useEffect, useRef, useState } from 'react';

interface YukataPattern {
    id: string;
    name: string;
    nameJp: string;
    theme: string;
    description: string;
    gradient: string;
}

export default function YukataWardrobeModal() {
    const { isYukataOpen, setYukataOpen, isAudioPlaying } = useBookstoreStore();
    const [selectedPatternIdx, setSelectedPatternIdx] = useState<number>(0);
    const [selectedObi, setSelectedObi] = useState<string>('crimson');
    const [hasMask, setHasMask] = useState<boolean>(true);
    const [hasFan, setHasFan] = useState<boolean>(false);
    const audioCtxRef = useRef<AudioContext | null>(null);

    const patterns: YukataPattern[] = [
        {
            id: 'sakura',
            name: 'Sakura Blossom Dye',
            nameJp: '桜染め絣',
            theme: 'Soft Petals on Charcoal Indigo',
            description: 'Delicate floating cherry blossoms woven into breathable summer cotton fabric.',
            gradient: 'from-pink-900/60 to-slate-900/80',
        },
        {
            id: 'asanoha',
            name: 'Asanoha Geometric',
            nameJp: '麻の葉模様',
            theme: 'Traditional Hemp Leaf Pattern',
            description: 'Centuries-old hexagonal geometric motif symbolizing vitality and resilience.',
            gradient: 'from-emerald-900/60 to-slate-900/80',
        },
        {
            id: 'seigaiha',
            name: 'Seigaiha Ocean Waves',
            nameJp: '青海波紋',
            theme: 'Auspicious Pacific Ripples',
            description: 'Arched overlapping cresting waves representing peace, good fortune, and calm seas.',
            gradient: 'from-sky-900/60 to-blue-950/80',
        },
        {
            id: 'hanabi',
            name: 'Midnight Hanabi Gold',
            nameJp: '隅田川花火',
            theme: 'Sumida River Festival Sparks',
            description: 'Vibrant gold sparks and fireworks bursts contrasting against deep midnight blue.',
            gradient: 'from-amber-900/60 to-indigo-950/80',
        },
    ];

    const obiColors = [
        { id: 'crimson', name: 'Crimson Red', hex: '#dc2626' },
        { id: 'gold', name: 'Mustard Gold', hex: '#d97706' },
        { id: 'violet', name: 'Imperial Violet', hex: '#7c3aed' },
        { id: 'white', name: 'Pure White Silk', hex: '#f8fafc' },
    ];

    const currentPattern = patterns[selectedPatternIdx];

    const handleClose = useCallback(() => {
        setYukataOpen(false);
    }, [setYukataOpen]);

    const playRustleSound = () => {
        if (!isAudioPlaying) return;
        if (!audioCtxRef.current) {
            const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            audioCtxRef.current = new AudioCtx();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') ctx.resume();

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.15);

        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.2);
    };

    const handleSelectPattern = (idx: number) => {
        playRustleSound();
        setSelectedPatternIdx(idx);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isYukataOpen) {
                handleClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isYukataOpen, handleClose]);

    if (!isYukataOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 md:p-6 backdrop-blur-2xl animate-in fade-in duration-200 select-none">
            <div className="relative flex flex-col w-full max-w-3xl rounded-3xl border border-rose-500/30 bg-gradient-to-b from-[#220c15]/95 to-[#0b0307]/95 p-6 md:p-8 shadow-2xl backdrop-blur-2xl">
                <button
                    onClick={handleClose}
                    className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all"
                >
                    ✕
                </button>

                <div className="flex items-center gap-3 border-b border-rose-500/20 pb-4 mb-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/20 border border-rose-400/40 text-rose-300 font-bold font-mono">
                        YUK
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-white">
                            Traditional Japanese Festival Yukata Wardrobe
                        </h2>
                        <p className="text-xs text-rose-400 font-medium">
                            Floor 1 Manga Sanctuary • Woven Cotton Robes, Geta Clogs & Accessories
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 flex flex-col items-center">
                        <div
                            className={`relative w-full aspect-[4/3] rounded-2xl border-2 border-white/15 bg-gradient-to-br ${currentPattern.gradient} overflow-hidden flex flex-col items-center justify-center p-6 text-center shadow-2xl relative`}
                        >
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)] pointer-events-none" />

                            <div className="z-10 flex flex-col items-center">
                                <span className="font-mono text-[11px] tracking-widest text-rose-300 uppercase mb-1">
                                    {currentPattern.nameJp}
                                </span>
                                <h3 className="text-2xl md:text-3xl font-black text-white tracking-wide">
                                    {currentPattern.name}
                                </h3>
                                <p className="text-xs text-white/70 max-w-sm mt-2">
                                    {currentPattern.description}
                                </p>
                                <div className="flex items-center gap-2 mt-4">
                                    <span className="font-mono text-[10px] px-2.5 py-1 rounded-full bg-white/10 text-white/80 border border-white/10">
                                        Obi: {obiColors.find((o) => o.id === selectedObi)?.name}
                                    </span>
                                    {hasMask && (
                                        <span className="font-mono text-[10px] px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/30">
                                            Kitsune Mask Equipped
                                        </span>
                                    )}
                                    {hasFan && (
                                        <span className="font-mono text-[10px] px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                                            Sensu Fan Equipped
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full mt-4">
                            <button
                                onClick={() => {
                                    playRustleSound();
                                    setHasMask((prev) => !prev);
                                }}
                                className={`flex-1 py-2.5 rounded-xl border text-xs font-mono transition-all ${
                                    hasMask
                                        ? 'border-rose-400 bg-rose-500/20 text-rose-300 font-bold'
                                        : 'border-white/15 bg-white/5 text-white/60 hover:text-white'
                                }`}
                            >
                                {hasMask ? 'Mask: EQUIPPED' : 'Mask: OFF'}
                            </button>
                            <button
                                onClick={() => {
                                    playRustleSound();
                                    setHasFan((prev) => !prev);
                                }}
                                className={`flex-1 py-2.5 rounded-xl border text-xs font-mono transition-all ${
                                    hasFan
                                        ? 'border-rose-400 bg-rose-500/20 text-rose-300 font-bold'
                                        : 'border-white/15 bg-white/5 text-white/60 hover:text-white'
                                }`}
                            >
                                {hasFan ? 'Sensu Fan: EQUIPPED' : 'Sensu Fan: OFF'}
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col space-y-4">
                        <div>
                            <label className="text-[11px] font-mono uppercase tracking-wider text-rose-300 block mb-2 font-bold">
                                Select Yukata Fabric
                            </label>
                            <div className="flex flex-col space-y-2">
                                {patterns.map((p, idx) => (
                                    <button
                                        key={p.id}
                                        onClick={() => handleSelectPattern(idx)}
                                        className={`p-2.5 rounded-xl border text-left transition-all ${
                                            selectedPatternIdx === idx
                                                ? 'border-rose-400 bg-rose-500/20 ring-1 ring-rose-400'
                                                : 'border-white/10 bg-white/5 hover:border-white/20'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-mono text-rose-300">
                                                {p.nameJp}
                                            </span>
                                        </div>
                                        <h4 className="text-xs font-bold text-white mt-0.5">
                                            {p.name}
                                        </h4>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-[11px] font-mono uppercase tracking-wider text-rose-300 block mb-2 font-bold">
                                Obi Sash Color
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                                {obiColors.map((o) => (
                                    <button
                                        key={o.id}
                                        onClick={() => {
                                            playRustleSound();
                                            setSelectedObi(o.id);
                                        }}
                                        style={{ backgroundColor: o.hex }}
                                        className={`h-8 rounded-xl border transition-all ${
                                            selectedObi === o.id
                                                ? 'border-white ring-2 ring-rose-400 scale-105'
                                                : 'border-white/20 opacity-80 hover:opacity-100'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                onClick={handleClose}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold uppercase tracking-wider text-xs shadow-lg hover:from-rose-400 hover:to-pink-400 transition-all"
                            >
                                Wear Traditional Yukata
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
