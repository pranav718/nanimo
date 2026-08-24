'use client';

import { useBookstoreStore } from '@/store/bookstoreStore';
import { useCallback, useEffect, useRef, useState } from 'react';

interface VinylRecord {
    id: string;
    title: string;
    artist: string;
    bpm: number;
    genre: string;
    coverColor: string;
}

export default function AnimeVinylDJModal() {
    const { isDJOpen, setDJOpen, isAudioPlaying } = useBookstoreStore();
    const [selectedTrack, setSelectedTrack] = useState<number>(0);
    const [isPlaying, setIsPlaying] = useState<boolean>(true);
    const [pitch, setPitch] = useState<number>(100);
    const [rotation, setRotation] = useState<number>(0);
    const audioCtxRef = useRef<AudioContext | null>(null);

    const records: VinylRecord[] = [
        { id: 'bebop', title: 'Tank! Bebop Brass Session', artist: 'The Seatbelts', bpm: 138, genre: 'Acid Big Band Jazz', coverColor: '#dc2626' },
        { id: 'champloo', title: 'Battlecry Lo-Fi Nostalgia', artist: 'Nujabes Style', bpm: 92, genre: 'Chill Samurai Hip-Hop', coverColor: '#2563eb' },
        { id: 'citypop', title: 'Midnight Plastic Romance', artist: 'Mariya Sunset', bpm: 108, genre: '80s Tokyo City Pop', coverColor: '#ec4899' },
        { id: 'eurobeat', title: 'Running on Mt. Akina', artist: 'Super Eurobeat', bpm: 155, genre: 'Touge High Speed Eurobeat', coverColor: '#f59e0b' },
    ];

    const current = records[selectedTrack] || records[0];

    const handleClose = useCallback(() => {
        setDJOpen(false);
    }, [setDJOpen]);

    const playScratchFX = () => {
        if (!isAudioPlaying) return;
        if (!audioCtxRef.current) {
            const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            audioCtxRef.current = new AudioCtx();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') ctx.resume();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const now = ctx.currentTime;

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(1400, now + 0.08);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.18);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.22);
    };

    useEffect(() => {
        if (!isDJOpen || !isPlaying) return;
        const interval = setInterval(() => {
            setRotation((prev) => (prev + (3 * (pitch / 100))) % 360);
        }, 30);
        return () => clearInterval(interval);
    }, [isDJOpen, isPlaying, pitch]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isDJOpen) {
                handleClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isDJOpen, handleClose]);

    if (!isDJOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6 backdrop-blur-2xl animate-in fade-in duration-200 select-none">
            <div className="relative flex flex-col w-full max-w-xl rounded-3xl border border-violet-500/30 bg-gradient-to-b from-[#180f28]/95 to-[#080510]/95 p-6 md:p-8 shadow-2xl backdrop-blur-2xl">
                <button
                    onClick={handleClose}
                    className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all"
                >
                    ✕
                </button>

                <div className="flex items-center gap-3 border-b border-violet-500/20 pb-4 mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/20 border border-violet-400/40 text-violet-300 font-bold font-mono">
                        DJ
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-white">
                            Anime Vinyl Turntable Booth
                        </h2>
                        <p className="text-xs text-violet-400 font-medium">
                            Floor 2 Screening Lounge • Direct-Drive Turntable
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6 bg-black/60 rounded-2xl p-5 border border-white/10 mb-6">
                    <div className="relative flex items-center justify-center">
                        <div
                            style={{ transform: `rotate(${rotation}deg)` }}
                            className="h-36 w-36 rounded-full bg-gradient-to-tr from-[#111] via-[#222] to-[#111] border-4 border-zinc-800 shadow-2xl flex items-center justify-center relative shadow-black/80"
                        >
                            <div className="absolute inset-2 rounded-full border border-zinc-700/40" />
                            <div className="absolute inset-5 rounded-full border border-zinc-700/30" />
                            <div className="absolute inset-8 rounded-full border border-zinc-700/20" />
                            <div
                                style={{ backgroundColor: current.coverColor }}
                                className="h-14 w-14 rounded-full flex items-center justify-center border-2 border-white/40 shadow-md"
                            >
                                <div className="h-3 w-3 rounded-full bg-black border border-white/50" />
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-between space-y-3 text-left">
                        <div>
                            <span className="text-[10px] font-mono font-bold text-violet-400 uppercase tracking-widest">
                                {current.genre} • {Math.round(current.bpm * (pitch / 100))} BPM
                            </span>
                            <h3 className="text-base font-bold text-white mt-0.5">
                                {current.title}
                            </h3>
                            <p className="text-xs text-white/50">{current.artist}</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsPlaying(!isPlaying)}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold font-mono uppercase tracking-wider transition-all ${
                                    isPlaying
                                        ? 'bg-violet-400 text-black shadow-lg shadow-violet-400/20'
                                        : 'border border-white/20 text-white/60 hover:text-white'
                                }`}
                            >
                                {isPlaying ? 'Spinning' : 'Paused'}
                            </button>

                            <button
                                onClick={playScratchFX}
                                className="px-4 py-1.5 rounded-full border border-violet-400/40 bg-violet-500/20 text-violet-300 text-xs font-bold font-mono uppercase tracking-wider hover:bg-violet-500/30 active:scale-95 transition-all"
                            >
                                Scratch FX
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 mb-6">
                    {records.map((r, idx) => (
                        <button
                            key={r.id}
                            onClick={() => setSelectedTrack(idx)}
                            className={`flex flex-col p-3 rounded-2xl border transition-all text-left ${
                                selectedTrack === idx
                                    ? 'border-violet-400 bg-violet-500/20 shadow-md'
                                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                            }`}
                        >
                            <span className="text-[10px] font-mono text-violet-300">{r.genre}</span>
                            <h4 className="text-xs font-bold text-white mt-0.5 truncate">{r.title}</h4>
                        </button>
                    ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs text-white/50">
                    <span>Pitch & Tempo</span>
                    <input
                        type="range"
                        min={80}
                        max={120}
                        value={pitch}
                        onChange={(e) => setPitch(parseInt(e.target.value, 10))}
                        className="w-44 accent-violet-400 cursor-pointer"
                    />
                    <span className="font-mono text-white/80">{pitch}%</span>
                </div>
            </div>
        </div>
    );
}
