'use client';

import { useBookstoreStore } from '@/store/bookstoreStore';
import { useCallback, useEffect, useState } from 'react';

interface TrophyItem {
    id: string;
    title: string;
    titleJp: string;
    rarity: 'SSR' | 'SR' | 'UR';
    lore: string;
    unlocked: boolean;
    color: string;
}

export default function TrophyShowcaseModal() {
    const { isTrophyOpen, setTrophyOpen, visitedFloors, hasRolledGachapon, hasTakenQuiz } = useBookstoreStore();
    const [selectedTrophy, setSelectedTrophy] = useState<number>(0);

    const handleClose = useCallback(() => {
        setTrophyOpen(false);
    }, [setTrophyOpen]);

    const trophies: TrophyItem[] = [
        {
            id: 'mecha',
            title: 'Golden Mecha Reactor Core',
            titleJp: '黄金機動炉心',
            rarity: 'UR',
            lore: 'An ancient hyper-dense reactor core retrieved from the deepest floor of the manga archives. Radiates boundless creative energy.',
            unlocked: visitedFloors.length >= 3,
            color: 'from-amber-500 to-yellow-600 border-amber-400',
        },
        {
            id: 'katana',
            title: 'Sakura Blossom Crystal Katana',
            titleJp: '桜華水晶刀',
            rarity: 'SSR',
            lore: 'Forged from petrified pink sakura crystals beneath the rooftop celestial observatory. Slices through reader writer\'s block.',
            unlocked: true,
            color: 'from-pink-500 to-rose-600 border-pink-400',
        },
        {
            id: 'gpen',
            title: 'Legendary Manga G-Pen',
            titleJp: '伝説のGペン',
            rarity: 'SSR',
            lore: 'A master mangaka pen nib infused with infinite screentone ink. Draws dynamic speedlines across reality.',
            unlocked: true,
            color: 'from-sky-500 to-blue-600 border-sky-400',
        },
        {
            id: 'astrolabe',
            title: 'Cosmic Stargazer Astrolabe',
            titleJp: '天体観測天球儀',
            rarity: 'UR',
            lore: 'A celestial brass astrolabe charting the anime studio constellations above the Tokyo skyline.',
            unlocked: hasTakenQuiz,
            color: 'from-indigo-500 to-violet-600 border-indigo-400',
        },
        {
            id: 'shrinebell',
            title: 'Sacred Shinto Fortune Bell',
            titleJp: '神道大吉鈴',
            rarity: 'SR',
            lore: 'A resonant brass kagura bell that brings great fortune (Daikichi) to all who seek stories in the archive.',
            unlocked: true,
            color: 'from-red-500 to-orange-600 border-red-400',
        },
        {
            id: 'vinylmaster',
            title: 'Vinyl DJ Golden Master Disc',
            titleJp: '金盤レコード',
            rarity: 'SR',
            lore: 'The original 1-of-1 vinyl pressing of classic Shibuya city pop and bebop jazz session tracks.',
            unlocked: hasRolledGachapon,
            color: 'from-purple-500 to-pink-600 border-purple-400',
        },
    ];

    const current = trophies[selectedTrophy] || trophies[0];

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isTrophyOpen) {
                handleClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isTrophyOpen, handleClose]);

    if (!isTrophyOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6 backdrop-blur-2xl animate-in fade-in duration-200 select-none">
            <div className="relative flex flex-col w-full max-w-2xl rounded-3xl border border-amber-500/30 bg-gradient-to-b from-[#241c0e]/95 to-[#0b0804]/95 p-6 md:p-8 shadow-2xl backdrop-blur-2xl">
                <button
                    onClick={handleClose}
                    className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all"
                >
                    ✕
                </button>

                <div className="flex items-center gap-3 border-b border-amber-500/20 pb-4 mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 font-bold font-mono">
                        CASE
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-white">
                            Otaku Artifact Trophy Showcase
                        </h2>
                        <p className="text-xs text-amber-400 font-medium">
                            Floor 2 Lounge Cabinet • Rare Exploration Relics
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 mb-6">
                    {trophies.map((t, idx) => {
                        const isChosen = selectedTrophy === idx;
                        return (
                            <button
                                key={t.id}
                                onClick={() => setSelectedTrophy(idx)}
                                className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center ${
                                    isChosen
                                        ? `bg-white/10 ${t.color} ring-2 ring-amber-400 scale-105 shadow-xl`
                                        : t.unlocked
                                        ? 'border-white/15 bg-white/5 hover:border-white/30 hover:bg-white/10'
                                        : 'border-white/5 bg-white/5 opacity-30 cursor-not-allowed'
                                }`}
                            >
                                <span className="text-[10px] font-mono font-bold text-amber-300 mb-1">
                                    {t.rarity}
                                </span>
                                <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white mb-1">
                                    {t.unlocked ? t.titleJp[0] : '?'}
                                </div>
                                <span className="text-[9px] text-white/80 truncate w-full">
                                    {t.unlocked ? t.title.split(' ')[0] : 'Locked'}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <div className="bg-black/60 rounded-2xl p-5 border border-white/10 mb-6 flex flex-col justify-between space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest">
                                {current.rarity} Relic • {current.titleJp}
                            </span>
                            <h3 className="text-lg font-bold text-white mt-0.5">
                                {current.title}
                            </h3>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold ${
                            current.unlocked ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40' : 'bg-red-500/20 text-red-300 border border-red-400/40'
                        }`}>
                            {current.unlocked ? 'Artifact Discovered' : 'Undiscovered Relic'}
                        </span>
                    </div>

                    <p className="text-xs text-white/70 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
                        {current.lore}
                    </p>
                </div>

                <button
                    onClick={handleClose}
                    className="w-full py-3 rounded-xl bg-amber-400 text-black font-bold uppercase tracking-wider text-xs shadow-lg hover:bg-amber-300 transition-all"
                >
                    Close Showcase
                </button>
            </div>
        </div>
    );
}
