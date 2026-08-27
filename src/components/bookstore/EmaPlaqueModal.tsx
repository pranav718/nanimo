'use client';

import { useBookstoreStore } from '@/store/bookstoreStore';
import { useCallback, useEffect, useRef, useState } from 'react';

interface EmaWish {
    id: string;
    kanji: string;
    kanjiMeaning: string;
    author: string;
    wish: string;
    date: string;
}

export default function EmaPlaqueModal() {
    const { isEmaOpen, setEmaOpen, isAudioPlaying } = useBookstoreStore();
    const [wishes, setWishes] = useState<EmaWish[]>([
        {
            id: '1',
            kanji: '幸福',
            kanjiMeaning: 'Happiness & Joy',
            author: 'Aoi from Kyoto',
            wish: 'May Kyoto Animation continue bringing warmth, light, and artistry to our world.',
            date: 'Today',
        },
        {
            id: '2',
            kanji: '必勝',
            kanjiMeaning: 'Triumph & Victory',
            author: 'Daiki from Tokyo',
            wish: 'Passing my university entrance exams so I can study sequential art and edit manga!',
            date: 'Yesterday',
        },
        {
            id: '3',
            kanji: '縁結',
            kanjiMeaning: 'Fated Destiny',
            author: 'Hina from Osaka',
            wish: 'Wishing for good health and infinite inspiration for all manga creators.',
            date: '2 days ago',
        },
    ]);

    const [selectedKanji, setSelectedKanji] = useState<string>('幸福');
    const [wishText, setWishText] = useState<string>('');
    const [authorName, setAuthorName] = useState<string>('');
    const audioCtxRef = useRef<AudioContext | null>(null);

    const kanjiStamps = [
        { kanji: '幸福', meaning: 'Happiness & Peace' },
        { kanji: '必勝', meaning: 'Victory & Success' },
        { kanji: '合格', meaning: 'Exam & Goal Pass' },
        { kanji: '縁結', meaning: 'Love & Bond' },
        { kanji: '健康', meaning: 'Vitality & Health' },
        { kanji: '夢叶', meaning: 'Dreams Realized' },
    ];

    const handleClose = useCallback(() => {
        setEmaOpen(false);
    }, [setEmaOpen]);

    const playChimeSound = () => {
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

        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1760, now + 0.4);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.55);
    };

    const handleAddWish = (e: React.FormEvent) => {
        e.preventDefault();
        if (!wishText.trim()) return;

        playChimeSound();
        const stampObj = kanjiStamps.find((k) => k.kanji === selectedKanji) || kanjiStamps[0];
        const newEma: EmaWish = {
            id: Math.random().toString(),
            kanji: selectedKanji,
            kanjiMeaning: stampObj.meaning,
            author: authorName.trim() || 'Shrine Visitor',
            wish: wishText.trim(),
            date: 'Just now',
        };

        setWishes((prev) => [newEma, ...prev]);
        setWishText('');
        setAuthorName('');
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isEmaOpen) {
                handleClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isEmaOpen, handleClose]);

    if (!isEmaOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 md:p-6 backdrop-blur-2xl animate-in fade-in duration-200 select-none">
            <div className="relative flex flex-col w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-red-500/30 bg-gradient-to-b from-[#240808]/95 to-[#0b0202]/95 p-6 md:p-8 shadow-2xl backdrop-blur-2xl">
                <button
                    onClick={handleClose}
                    className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all"
                >
                    ✕
                </button>

                <div className="flex items-center gap-3 border-b border-red-500/20 pb-4 mb-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/20 border border-red-400/40 text-red-300 font-bold font-mono">
                        EMA
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-white">
                            Traditional Shrine Ema Wish Plaque Wall
                        </h2>
                        <p className="text-xs text-red-400 font-medium">
                            Floor 3 Observatory • Carve Blessings & Hang Wooden Votive Plaques
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 flex flex-col space-y-3">
                        <label className="text-[11px] font-mono uppercase tracking-wider text-red-300 block font-bold">
                            Hanging Votive Plaques ({wishes.length})
                        </label>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {wishes.map((w) => (
                                <div
                                    key={w.id}
                                    className="p-4 rounded-2xl border-2 border-amber-800/40 bg-gradient-to-br from-[#451a03] to-[#291002] shadow-md flex flex-col justify-between min-h-[140px] relative overflow-hidden"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-2xl font-black text-amber-200 drop-shadow">
                                            {w.kanji}
                                        </span>
                                        <span className="font-mono text-[9px] px-2 py-0.5 rounded bg-black/40 text-amber-300 border border-amber-500/30">
                                            {w.kanjiMeaning}
                                        </span>
                                    </div>
                                    <p className="text-xs text-amber-100/90 leading-relaxed font-sans italic mb-3">
                                        &quot;{w.wish}&quot;
                                    </p>
                                    <div className="flex items-center justify-between text-[10px] font-mono text-amber-300/60 border-t border-amber-900/40 pt-2">
                                        <span>{w.author}</span>
                                        <span>{w.date}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col space-y-4">
                        <form onSubmit={handleAddWish} className="bg-black/60 rounded-2xl p-5 border border-white/10 flex flex-col space-y-3">
                            <h4 className="text-xs font-bold text-red-300 uppercase tracking-wider font-mono">
                                Carve New Ema Plaque
                            </h4>

                            <div>
                                <label className="text-[10px] font-mono text-white/60 block mb-1.5">
                                    Select Blessing Kanji
                                </label>
                                <div className="grid grid-cols-3 gap-1.5">
                                    {kanjiStamps.map((k) => (
                                        <button
                                            type="button"
                                            key={k.kanji}
                                            onClick={() => {
                                                playChimeSound();
                                                setSelectedKanji(k.kanji);
                                            }}
                                            className={`p-1.5 rounded-xl border text-center transition-all ${
                                                selectedKanji === k.kanji
                                                    ? 'border-red-400 bg-red-500/30 text-white font-bold ring-1 ring-red-400'
                                                    : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                                            }`}
                                        >
                                            <div className="text-sm font-bold">{k.kanji}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <input
                                    type="text"
                                    placeholder="Your Name (Optional)..."
                                    value={authorName}
                                    onChange={(e) => setAuthorName(e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/40 focus:border-red-400 focus:outline-none"
                                />
                            </div>

                            <div>
                                <textarea
                                    placeholder="Write your heartfelt wish or blessing..."
                                    rows={3}
                                    value={wishText}
                                    onChange={(e) => setWishText(e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/40 focus:border-red-400 focus:outline-none resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-2.5 rounded-xl bg-red-600 text-white font-bold uppercase tracking-wider text-xs shadow-lg hover:bg-red-500 transition-all shadow-red-600/20"
                            >
                                Hang Plaque on Shrine Rack
                            </button>
                        </form>
                    </div>
                </div>

                <button
                    onClick={handleClose}
                    className="mt-6 w-full py-2.5 rounded-xl bg-white/10 border border-white/15 text-white font-bold uppercase tracking-wider text-xs hover:bg-white/20 transition-all"
                >
                    Step Away From Shrine
                </button>
            </div>
        </div>
    );
}
