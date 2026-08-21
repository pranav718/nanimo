'use client';

import { useBookstoreStore } from '@/store/bookstoreStore';
import { AnimeMedia, BookstoreGenre } from '@/types';
import { useCallback, useEffect, useState } from 'react';

export default function AnimeQuizModal() {
    const { isQuizOpen, setQuizOpen, mangaGenres, animeGenres, trendingAnime, trendingManga, setInspectedMedia, toggleSaveMedia, isMediaSaved } = useBookstoreStore();
    const [step, setStep] = useState(0);
    const [scores, setScores] = useState<Record<string, number>>({
        Action: 0,
        Fantasy: 0,
        'Sci-Fi': 0,
        Mystery: 0,
        'Slice of Life': 0,
        Romance: 0,
    });
    const [result, setResult] = useState<{
        archetype: string;
        tagline: string;
        genre: BookstoreGenre;
        matchedMedia: AnimeMedia | null;
    } | null>(null);

    const questions = [
        {
            title: 'What is your ideal weekend atmosphere?',
            options: [
                { label: 'A cozy corner cafe with warm tea and rain outside', genre: 'Slice of Life' },
                { label: 'An intense training session or adrenaline-filled sport', genre: 'Action' },
                { label: 'Exploring neon-lit cyber alleys and hidden tech secrets', genre: 'Sci-Fi' },
                { label: 'Wandering an ancient magical forest or medieval ruins', genre: 'Fantasy' },
            ],
        },
        {
            title: 'What drives your core decisions in life?',
            options: [
                { label: 'Protecting comrades and standing up against injustice', genre: 'Action' },
                { label: 'Deep emotional bonds and true heartfelt connection', genre: 'Romance' },
                { label: 'Unraveling psychological puzzles and finding the hidden truth', genre: 'Mystery' },
                { label: 'Inventing new ideas and exploring future frontiers', genre: 'Sci-Fi' },
            ],
        },
        {
            title: 'When confronted with a crisis, what is your approach?',
            options: [
                { label: 'Analyze the enemy patterns and devise a calculated counter', genre: 'Mystery' },
                { label: 'Charge in with pure willpower, grit, and conviction', genre: 'Action' },
                { label: 'Stay calm, seek harmony, and support everyone around me', genre: 'Slice of Life' },
                { label: 'Cast a high-tier ancient spell or summon an artifact', genre: 'Fantasy' },
            ],
        },
        {
            title: 'Choose your signature ability:',
            options: [
                { label: 'Domain Expansion & Overwhelming Martial Instinct', genre: 'Action' },
                { label: 'Time Manipulation & Memory Reading', genre: 'Sci-Fi' },
                { label: 'Ancient Healing Magic & Elemental Conjuration', genre: 'Fantasy' },
                { label: 'Unshakable Empathy that melts even the coldest hearts', genre: 'Slice of Life' },
            ],
        },
    ];

    const handleClose = useCallback(() => {
        setQuizOpen(false);
        setStep(0);
        setResult(null);
        setScores({ Action: 0, Fantasy: 0, 'Sci-Fi': 0, Mystery: 0, 'Slice of Life': 0, Romance: 0 });
    }, [setQuizOpen]);

    const handleSelectOption = (genre: string) => {
        const nextScores = { ...scores, [genre]: (scores[genre] || 0) + 1 };
        setScores(nextScores);

        if (step + 1 < questions.length) {
            setStep(step + 1);
        } else {
            calculateResult(nextScores);
        }
    };

    const calculateResult = (finalScores: Record<string, number>) => {
        let bestGenre: BookstoreGenre = 'Action';
        let maxVal = -1;

        Object.entries(finalScores).forEach(([g, val]) => {
            if (val > maxVal) {
                maxVal = val;
                bestGenre = g as BookstoreGenre;
            }
        });

        const archetypes: Record<BookstoreGenre, { name: string; tagline: string }> = {
            Action: { name: 'The Unyielding Vanguard', tagline: 'Driven by fiery passion and unbreakable resolve.' },
            Fantasy: { name: 'The Astral Archmage', tagline: 'Drawn to ancient magic, forgotten lands, and timeless lore.' },
            'Sci-Fi': { name: 'The Cyber Architect', tagline: 'Visionary mind attuned to neon horizons and future paradigms.' },
            Mystery: { name: 'The Mastermind Sleuth', tagline: 'Unravels the deepest human enigmas with piercing intellect.' },
            'Slice of Life': { name: 'The Serene Wanderer', tagline: 'Treasures quiet everyday moments and mindful warmth.' },
            Romance: { name: 'The Heartfelt Luminary', tagline: 'Deeply empathic, celebrating the beauty of heartfelt bonds.' },
        };

        const arch = archetypes[bestGenre] || archetypes.Action;
        const pool = [...(animeGenres[bestGenre] || []), ...(mangaGenres[bestGenre] || [])];
        const matched = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : trendingAnime[0] || null;

        setResult({
            archetype: arch.name,
            tagline: arch.tagline,
            genre: bestGenre,
            matchedMedia: matched,
        });
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isQuizOpen) {
                handleClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isQuizOpen, handleClose]);

    if (!isQuizOpen) return null;

    const currentQ = questions[step];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6 backdrop-blur-2xl animate-in fade-in duration-200 select-none">
            <div className="relative flex flex-col w-full max-w-xl max-h-[85vh] rounded-3xl border border-pink-500/30 bg-gradient-to-b from-[#240a18]/95 to-[#0b0307]/95 p-6 md:p-8 shadow-2xl backdrop-blur-2xl overflow-y-auto">
                <button
                    onClick={handleClose}
                    className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all"
                >
                    ✕
                </button>

                <div className="flex items-center gap-2 mb-6">
                    <span className="rounded-full bg-pink-500/20 border border-pink-400/40 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-pink-300">
                        Anime Soul Quiz
                    </span>
                    {!result && (
                        <span className="text-xs font-mono text-white/40">
                            Question {step + 1} of {questions.length}
                        </span>
                    )}
                </div>

                {!result ? (
                    <div className="flex flex-col gap-6">
                        <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                            {currentQ.title}
                        </h3>

                        <div className="flex flex-col gap-3">
                            {currentQ.options.map((opt, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSelectOption(opt.genre)}
                                    className="group flex items-center justify-between p-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-pink-500/20 hover:border-pink-400/50 transition-all text-left"
                                >
                                    <span className="text-xs md:text-sm font-medium text-white/90 group-hover:text-pink-200">
                                        {opt.label}
                                    </span>
                                    <span className="text-xs font-bold text-pink-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0 ml-2">
                                        →
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
                        <div className="h-16 w-16 rounded-full bg-pink-500/20 border-2 border-pink-400/50 flex items-center justify-center text-pink-300 font-bold text-lg mb-3 shadow-lg shadow-pink-500/20">
                            魂
                        </div>

                        <h3 className="text-2xl font-extrabold text-white tracking-tight">
                            {result.archetype}
                        </h3>
                        <p className="text-xs text-pink-300 font-medium mt-1 mb-4">
                            {result.tagline}
                        </p>

                        {result.matchedMedia && (
                            <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center gap-4 text-left mb-6">
                                <div
                                    className="h-20 w-14 rounded-xl bg-cover bg-center shrink-0 border border-white/10"
                                    style={{
                                        backgroundImage: `url(${result.matchedMedia.coverImage.medium || result.matchedMedia.coverImage.large})`,
                                    }}
                                />
                                <div className="min-w-0 flex-1">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                                        Soul Mate Match
                                    </span>
                                    <h4 className="text-sm font-bold text-white truncate">
                                        {result.matchedMedia.title.english || result.matchedMedia.title.romaji}
                                    </h4>
                                    <p className="text-xs text-white/50 truncate">
                                        {result.matchedMedia.genres.join(' • ')}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col w-full gap-2.5">
                            {result.matchedMedia && (
                                <button
                                    onClick={() => {
                                        setInspectedMedia(result.matchedMedia);
                                        handleClose();
                                    }}
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold uppercase tracking-wider text-xs shadow-lg hover:from-pink-400 hover:to-rose-500 transition-all"
                                >
                                    Inspect Soul Match Volume
                                </button>
                            )}

                            <div className="flex gap-2">
                                {result.matchedMedia && (
                                    <button
                                        onClick={() => toggleSaveMedia(result.matchedMedia!)}
                                        className={`flex-1 py-2.5 rounded-xl border text-xs font-semibold uppercase tracking-wider transition-all ${
                                            isMediaSaved(result.matchedMedia.id)
                                                ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                                                : 'bg-white/5 border-white/15 text-white/80 hover:bg-white/10'
                                        }`}
                                    >
                                        {isMediaSaved(result.matchedMedia.id) ? 'Saved in Shelf' : 'Save to Shelf'}
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        setStep(0);
                                        setResult(null);
                                        setScores({ Action: 0, Fantasy: 0, 'Sci-Fi': 0, Mystery: 0, 'Slice of Life': 0, Romance: 0 });
                                    }}
                                    className="flex-1 py-2.5 rounded-xl border border-white/15 bg-white/5 text-white/80 hover:bg-white/10 text-xs font-semibold uppercase tracking-wider transition-all"
                                >
                                    Retake Quiz
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
