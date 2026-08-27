'use client';

import { useBookstoreStore } from '@/store/bookstoreStore';
import { useCallback, useEffect, useRef, useState } from 'react';

interface BookSlip {
    id: string;
    mangaTitle: string;
    readerName: string;
    note: string;
    likes: number;
    tag: string;
}

export default function BookExchangeModal() {
    const { isBookExchangeOpen, setBookExchangeOpen, isAudioPlaying } = useBookstoreStore();
    const [slips, setSlips] = useState<BookSlip[]>([
        {
            id: '1',
            mangaTitle: 'Vinland Saga',
            readerName: 'Ren from Shibuya',
            note: 'The Farmland arc taught me what it truly means to carry no enemies.',
            likes: 42,
            tag: 'Masterpiece',
        },
        {
            id: '2',
            mangaTitle: 'Yotsuba&!',
            readerName: 'Sakura from Kichijoji',
            note: 'Whenever life feels heavy, chapter 28 under the cicadas fixes everything.',
            likes: 29,
            tag: 'Comfort',
        },
        {
            id: '3',
            mangaTitle: 'Monster',
            readerName: 'Kenji from Shinjuku',
            note: 'Naoki Urasawa pacing is unmatched. Read it late at night under a desk lamp.',
            likes: 38,
            tag: 'Thriller',
        },
    ]);

    const [newTitle, setNewTitle] = useState<string>('');
    const [newNote, setNewNote] = useState<string>('');
    const [authorName, setAuthorName] = useState<string>('');
    const audioCtxRef = useRef<AudioContext | null>(null);

    const handleClose = useCallback(() => {
        setBookExchangeOpen(false);
    }, [setBookExchangeOpen]);

    const playPaperSound = () => {
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
        osc.frequency.setValueAtTime(500, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.1);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.14);
    };

    const handleAddSlip = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim() || !newNote.trim()) return;

        playPaperSound();
        const newSlip: BookSlip = {
            id: Math.random().toString(),
            mangaTitle: newTitle.trim(),
            readerName: authorName.trim() || 'Anonymous Reader',
            note: newNote.trim(),
            likes: 1,
            tag: 'Reader Pick',
        };

        setSlips((prev) => [newSlip, ...prev]);
        setNewTitle('');
        setNewNote('');
    };

    const handleLike = (id: string) => {
        playPaperSound();
        setSlips((prev) =>
            prev.map((s) => (s.id === id ? { ...s, likes: s.likes + 1 } : s))
        );
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isBookExchangeOpen) {
                handleClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isBookExchangeOpen, handleClose]);

    if (!isBookExchangeOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 md:p-6 backdrop-blur-2xl animate-in fade-in duration-200 select-none">
            <div className="relative flex flex-col w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-amber-500/30 bg-gradient-to-b from-[#241708]/95 to-[#0c0702]/95 p-6 md:p-8 shadow-2xl backdrop-blur-2xl">
                <button
                    onClick={handleClose}
                    className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all"
                >
                    ✕
                </button>

                <div className="flex items-center gap-3 border-b border-amber-500/20 pb-4 mb-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 font-bold font-mono">
                        SWAP
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-white">
                            Community Manga Lending & Recommendation Corner
                        </h2>
                        <p className="text-xs text-amber-400 font-medium">
                            Floor 1 Manga Sanctuary • Handwritten Reader Slips & Book Drops
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 flex flex-col space-y-3">
                        <label className="text-[11px] font-mono uppercase tracking-wider text-amber-300 block font-bold">
                            Reader Recommendation Slips ({slips.length})
                        </label>

                        <div className="flex flex-col space-y-3">
                            {slips.map((s) => (
                                <div
                                    key={s.id}
                                    className="p-4 rounded-2xl border border-amber-400/20 bg-black/50 hover:border-amber-400/40 transition-all relative overflow-hidden"
                                >
                                    <div className="flex items-center justify-between mb-1.5">
                                        <h4 className="text-sm font-bold text-white tracking-wide">
                                            {s.mangaTitle}
                                        </h4>
                                        <span className="font-mono text-[9px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30">
                                            {s.tag}
                                        </span>
                                    </div>
                                    <p className="text-xs text-white/80 leading-relaxed font-sans mb-3">
                                        &quot;{s.note}&quot;
                                    </p>
                                    <div className="flex items-center justify-between text-[10px] font-mono text-white/50 border-t border-white/5 pt-2">
                                        <span>Left by {s.readerName}</span>
                                        <button
                                            onClick={() => handleLike(s.id)}
                                            className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 transition-colors"
                                        >
                                            <span>Helpful ({s.likes})</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col space-y-4">
                        <form onSubmit={handleAddSlip} className="bg-black/60 rounded-2xl p-5 border border-white/10 flex flex-col space-y-3">
                            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider font-mono">
                                Leave A Book Slip
                            </h4>
                            <div>
                                <input
                                    type="text"
                                    placeholder="Manga Title..."
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/40 focus:border-amber-400 focus:outline-none"
                                />
                            </div>
                            <div>
                                <input
                                    type="text"
                                    placeholder="Your Name (Optional)..."
                                    value={authorName}
                                    onChange={(e) => setAuthorName(e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/40 focus:border-amber-400 focus:outline-none"
                                />
                            </div>
                            <div>
                                <textarea
                                    placeholder="Why do you recommend this manga?..."
                                    rows={3}
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/40 focus:border-amber-400 focus:outline-none resize-none"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-2.5 rounded-xl bg-amber-400 text-black font-bold uppercase tracking-wider text-xs shadow-lg hover:bg-amber-300 transition-all"
                            >
                                Pin Slip to Board
                            </button>
                        </form>
                    </div>
                </div>

                <button
                    onClick={handleClose}
                    className="mt-6 w-full py-2.5 rounded-xl bg-white/10 border border-white/15 text-white font-bold uppercase tracking-wider text-xs hover:bg-white/20 transition-all"
                >
                    Close Community Corner
                </button>
            </div>
        </div>
    );
}
