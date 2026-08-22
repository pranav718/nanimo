'use client';

import { useBookstoreStore } from '@/store/bookstoreStore';
import { useCallback, useEffect } from 'react';

export default function ReadingGoalModal() {
    const {
        isReadingGoalOpen,
        setReadingGoalOpen,
        readingGoalChapters,
        readingChaptersCompleted,
        setReadingChaptersCompleted,
        readingStreakDays,
    } = useBookstoreStore();

    const handleClose = useCallback(() => {
        setReadingGoalOpen(false);
    }, [setReadingGoalOpen]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isReadingGoalOpen) {
                handleClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isReadingGoalOpen, handleClose]);

    if (!isReadingGoalOpen) return null;

    const progress = Math.min(100, Math.round((readingChaptersCompleted / readingGoalChapters) * 100));

    const tiers = [
        { name: 'Apprentice Reader', chapters: 5, unlocked: readingChaptersCompleted >= 5 },
        { name: 'Otaku Scholar', chapters: 15, unlocked: readingChaptersCompleted >= 15 },
        { name: 'Grand Manga Sage', chapters: 30, unlocked: readingChaptersCompleted >= 30 },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6 backdrop-blur-2xl animate-in fade-in duration-200 select-none">
            <div className="relative flex flex-col w-full max-w-lg rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-[#0f1d16]/95 to-[#050b08]/95 p-6 md:p-8 shadow-2xl backdrop-blur-2xl">
                <button
                    onClick={handleClose}
                    className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all"
                >
                    ✕
                </button>

                <div className="flex items-center justify-between border-b border-emerald-500/20 pb-4 mb-6">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="rounded-full bg-emerald-500/20 border border-emerald-400/40 px-3 py-0.5 text-xs font-bold text-emerald-300 uppercase tracking-widest">
                                Goal Tracker
                            </span>
                            <span className="text-xs font-mono text-white/50">
                                {readingStreakDays} Day Streak
                            </span>
                        </div>
                        <h2 className="text-xl font-bold text-white tracking-tight mt-1">
                            Manga Reading Goal
                        </h2>
                    </div>

                    <div className="text-right mr-10">
                        <span className="text-2xl font-extrabold font-mono text-emerald-400">
                            {progress}%
                        </span>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest">
                            Completed
                        </p>
                    </div>
                </div>

                <div className="bg-black/50 border border-white/10 rounded-2xl p-5 mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-white/70 font-semibold">
                            Weekly Target Progress
                        </span>
                        <span className="text-xs font-mono text-emerald-300 font-bold">
                            {readingChaptersCompleted} / {readingGoalChapters} Chapters
                        </span>
                    </div>

                    <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden mb-4">
                        <div
                            style={{ width: `${progress}%` }}
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                        />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <span className="text-xs text-white/50">Log Chapters Read</span>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setReadingChaptersCompleted(Math.max(0, readingChaptersCompleted - 1))}
                                className="h-8 w-8 rounded-full border border-white/20 bg-white/5 text-white flex items-center justify-center font-bold hover:bg-white/10"
                            >
                                -
                            </button>
                            <span className="font-mono text-sm font-bold text-white w-6 text-center">
                                {readingChaptersCompleted}
                            </span>
                            <button
                                onClick={() => setReadingChaptersCompleted(readingChaptersCompleted + 1)}
                                className="h-8 w-8 rounded-full bg-emerald-400 text-black flex items-center justify-center font-bold hover:bg-emerald-300"
                            >
                                +
                            </button>
                        </div>
                    </div>
                </div>

                <div className="space-y-2 mb-6">
                    <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">
                        Reading Achievements
                    </h4>
                    {tiers.map((tier) => (
                        <div
                            key={tier.name}
                            className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                                tier.unlocked
                                    ? 'bg-emerald-500/10 border-emerald-400/40 text-white'
                                    : 'bg-white/5 border-white/5 opacity-40 text-white/40'
                            }`}
                        >
                            <span className="text-xs font-bold">{tier.name}</span>
                            <span className="text-[10px] font-mono">
                                {tier.unlocked ? 'Unlocked' : `${tier.chapters} Chapters`}
                            </span>
                        </div>
                    ))}
                </div>

                <button
                    onClick={handleClose}
                    className="w-full py-3 rounded-xl bg-emerald-400 text-black font-bold uppercase tracking-wider text-xs shadow-lg hover:bg-emerald-300 transition-all"
                >
                    Continue Reading
                </button>
            </div>
        </div>
    );
}
