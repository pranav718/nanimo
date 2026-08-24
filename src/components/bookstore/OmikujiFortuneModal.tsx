'use client';

import { useBookstoreStore } from '@/store/bookstoreStore';
import { useCallback, useEffect, useRef, useState } from 'react';

interface FortuneResult {
    level: string;
    levelJp: string;
    kanji: string;
    summary: string;
    luckyGenre: string;
    luckyColor: string;
    quote: string;
    animeRef: string;
}

export default function OmikujiFortuneModal() {
    const { isFortuneOpen, setFortuneOpen, isAudioPlaying } = useBookstoreStore();
    const [isDrawing, setIsDrawing] = useState<boolean>(false);
    const [fortune, setFortune] = useState<FortuneResult | null>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);

    const fortunes: FortuneResult[] = [
        {
            level: 'Great Blessing',
            levelJp: '大吉 (Daikichi)',
            kanji: '夢 (Dream)',
            summary: 'The celestial stars align above the bookstore. An unexpected masterpiece will deeply inspire your next creative endeavor.',
            luckyGenre: 'Fantasy & Isekai',
            luckyColor: 'Golden Amber',
            quote: 'Whatever you lose, you will find it again. But what you throw away you will never get back.',
            animeRef: 'Rurouni Kenshin',
        },
        {
            level: 'Middle Blessing',
            levelJp: '中吉 (Chukichi)',
            kanji: '道 (Journey)',
            summary: 'Your path is steady and clear. A quiet evening spent with a warm cup of tea and a heartfelt manga volume will bring peaceful clarity.',
            luckyGenre: 'Slice of Life',
            luckyColor: 'Sakura Pink',
            quote: 'If you don’t take risks, you can’t create a future.',
            animeRef: 'One Piece',
        },
        {
            level: 'Small Blessing',
            levelJp: '小吉 (Shokichi)',
            kanji: '心 (Heart)',
            summary: 'Gentle winds whisper good fortune. Revisit a favorite classic anime series you have not watched in years.',
            luckyGenre: 'Romance',
            luckyColor: 'Sky Cyan',
            quote: 'Even if I lose this feeling, I’m sure I’ll just fall in love with you all over again.',
            animeRef: 'Cardcaptor Sakura',
        },
        {
            level: 'Future Blessing',
            levelJp: '吉 (Kichi)',
            kanji: '力 (Strength)',
            summary: 'A thrilling breakthrough approaches. Face upcoming challenges with courage and unyielding willpower.',
            luckyGenre: 'Action & Shonen',
            luckyColor: 'Crimson Red',
            quote: 'Push past your limits. Right here, right now.',
            animeRef: 'Black Clover',
        },
    ];

    const handleClose = useCallback(() => {
        setFortuneOpen(false);
        setIsDrawing(false);
    }, [setFortuneOpen]);

    const playBambooClapper = () => {
        if (!isAudioPlaying) return;
        if (!audioCtxRef.current) {
            const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            audioCtxRef.current = new AudioCtx();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') ctx.resume();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        const now = ctx.currentTime;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.12);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1100, now);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.16);
    };

    const drawFortune = () => {
        setIsDrawing(true);
        playBambooClapper();

        setTimeout(() => {
            const chosen = fortunes[Math.floor(Math.random() * fortunes.length)];
            setFortune(chosen);
            setIsDrawing(false);
        }, 600);
    };

    useEffect(() => {
        if (isFortuneOpen && !fortune) {
            drawFortune();
        }
    }, [isFortuneOpen]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isFortuneOpen) {
                handleClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isFortuneOpen, handleClose]);

    if (!isFortuneOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6 backdrop-blur-2xl animate-in fade-in duration-200 select-none">
            <div className="relative flex flex-col w-full max-w-lg rounded-3xl border border-red-500/30 bg-gradient-to-b from-[#240b0b]/95 to-[#0b0404]/95 p-6 md:p-8 shadow-2xl backdrop-blur-2xl">
                <button
                    onClick={handleClose}
                    className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all"
                >
                    ✕
                </button>

                <div className="flex items-center justify-between border-b border-red-500/20 pb-4 mb-6">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="rounded-full bg-red-500/20 border border-red-400/40 px-3 py-0.5 text-xs font-bold text-red-300 uppercase tracking-widest">
                                Shinto Shrine
                            </span>
                            <span className="text-xs font-mono text-white/50">
                                3F Rooftop Sanctuary
                            </span>
                        </div>
                        <h2 className="text-xl font-bold text-white tracking-tight mt-1">
                            Daily Omikuji Fortune
                        </h2>
                    </div>
                </div>

                {isDrawing ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="h-16 w-16 rounded-full border-4 border-red-500 border-t-transparent animate-spin mb-4" />
                        <p className="text-xs font-mono text-white/60 uppercase tracking-widest">
                            Drawing Sacred Fortune Scroll...
                        </p>
                    </div>
                ) : fortune ? (
                    <div className="flex flex-col animate-in fade-in">
                        <div className="flex items-center justify-between bg-black/50 border border-white/10 rounded-2xl p-5 mb-5 shadow-inner">
                            <div className="flex items-center gap-4">
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 text-white font-serif font-black text-2xl shadow-xl">
                                    {fortune.kanji}
                                </div>
                                <div>
                                    <span className="text-xs font-bold font-mono text-red-400">
                                        {fortune.levelJp}
                                    </span>
                                    <h3 className="text-xl font-bold text-white">
                                        {fortune.level}
                                    </h3>
                                </div>
                            </div>
                        </div>

                        <p className="text-xs md:text-sm text-white/80 leading-relaxed mb-4 bg-white/5 p-4 rounded-xl border border-white/10">
                            {fortune.summary}
                        </p>

                        <div className="grid grid-cols-2 gap-3 mb-5 text-xs">
                            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                <span className="text-[10px] uppercase font-mono text-white/40 block mb-1">
                                    Lucky Genre
                                </span>
                                <span className="font-bold text-amber-300">
                                    {fortune.luckyGenre}
                                </span>
                            </div>
                            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                <span className="text-[10px] uppercase font-mono text-white/40 block mb-1">
                                    Lucky Aura
                                </span>
                                <span className="font-bold text-red-300">
                                    {fortune.luckyColor}
                                </span>
                            </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 mb-6">
                            <p className="text-xs italic text-white/70">
                                &quot;{fortune.quote}&quot;
                            </p>
                            <span className="text-[10px] font-mono text-white/40 block text-right mt-1">
                                — {fortune.animeRef}
                            </span>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={drawFortune}
                                className="flex-1 py-3 rounded-xl border border-white/15 bg-white/5 text-white font-bold uppercase tracking-wider text-xs hover:bg-white/10 transition-all"
                            >
                                Draw Another
                            </button>
                            <button
                                onClick={handleClose}
                                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 text-white font-bold uppercase tracking-wider text-xs shadow-lg hover:from-red-500 hover:to-amber-400 transition-all"
                            >
                                Keep Blessing
                            </button>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
