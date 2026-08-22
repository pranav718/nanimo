'use client';

import { useBookstoreStore } from '@/store/bookstoreStore';
import { useCallback, useEffect, useRef, useState } from 'react';

type WaveType = 'sine' | 'sawtooth' | 'square' | 'triangle';

interface PresetMelody {
    name: string;
    jp: string;
    notes: { freq: number; duration: number }[];
}

export default function AnimeSynthesizerModal() {
    const { isSynthOpen, setSynthOpen } = useBookstoreStore();
    const [waveType, setWaveType] = useState<WaveType>('triangle');
    const [octave, setOctave] = useState<number>(4);
    const [activeKey, setActiveKey] = useState<string | null>(null);
    const [isPlayingPreset, setIsPlayingPreset] = useState<boolean>(false);
    const audioCtxRef = useRef<AudioContext | null>(null);

    const handleClose = useCallback(() => {
        setSynthOpen(false);
        setIsPlayingPreset(false);
    }, [setSynthOpen]);

    const getAudioContext = () => {
        if (!audioCtxRef.current) {
            const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            audioCtxRef.current = new AudioCtx();
        }
        if (audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
        }
        return audioCtxRef.current;
    };

    const playTone = (freq: number, duration = 0.35) => {
        const ctx = getAudioContext();
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = waveType;
        osc.frequency.setValueAtTime(freq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(waveType === 'sawtooth' ? 1400 : 3000, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.08, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + duration + 0.05);
    };

    const keys = [
        { note: 'C', isBlack: false, keyLabel: 'A', semi: 0 },
        { note: 'C#', isBlack: true, keyLabel: 'W', semi: 1 },
        { note: 'D', isBlack: false, keyLabel: 'S', semi: 2 },
        { note: 'D#', isBlack: true, keyLabel: 'E', semi: 3 },
        { note: 'E', isBlack: false, keyLabel: 'D', semi: 4 },
        { note: 'F', isBlack: false, keyLabel: 'F', semi: 5 },
        { note: 'F#', isBlack: true, keyLabel: 'T', semi: 6 },
        { note: 'G', isBlack: false, keyLabel: 'G', semi: 7 },
        { note: 'G#', isBlack: true, keyLabel: 'Y', semi: 8 },
        { note: 'A', isBlack: false, keyLabel: 'H', semi: 9 },
        { note: 'A#', isBlack: true, keyLabel: 'U', semi: 10 },
        { note: 'B', isBlack: false, keyLabel: 'J', semi: 11 },
        { note: 'C5', isBlack: false, keyLabel: 'K', semi: 12 },
    ];

    const getFrequency = (semi: number) => {
        const baseA4 = 440;
        const semiFromA4 = (octave - 4) * 12 + semi - 9;
        return baseA4 * Math.pow(2, semiFromA4 / 12);
    };

    const handleKeyPlay = (noteName: string, semi: number) => {
        setActiveKey(noteName);
        playTone(getFrequency(semi));
        setTimeout(() => setActiveKey(null), 180);
    };

    const presets: PresetMelody[] = [
        {
            name: "A Cruel Angel's Thesis",
            jp: '残酷な天使のテーゼ (Evangelion)',
            notes: [
                { freq: 261.63, duration: 0.25 },
                { freq: 293.66, duration: 0.25 },
                { freq: 329.63, duration: 0.25 },
                { freq: 349.23, duration: 0.25 },
                { freq: 392.00, duration: 0.4 },
                { freq: 349.23, duration: 0.25 },
                { freq: 329.63, duration: 0.25 },
                { freq: 293.66, duration: 0.5 },
            ],
        },
        {
            name: 'Sadness and Sorrow',
            jp: '哀と悲 (Naruto)',
            notes: [
                { freq: 220.00, duration: 0.35 },
                { freq: 261.63, duration: 0.35 },
                { freq: 329.63, duration: 0.4 },
                { freq: 293.66, duration: 0.35 },
                { freq: 261.63, duration: 0.35 },
                { freq: 220.00, duration: 0.6 },
            ],
        },
        {
            name: 'Summer Theme',
            jp: 'Summer (Joe Hisaishi)',
            notes: [
                { freq: 293.66, duration: 0.2 },
                { freq: 329.63, duration: 0.2 },
                { freq: 369.99, duration: 0.2 },
                { freq: 440.00, duration: 0.35 },
                { freq: 369.99, duration: 0.2 },
                { freq: 329.63, duration: 0.2 },
                { freq: 293.66, duration: 0.4 },
            ],
        },
        {
            name: 'Gurenge',
            jp: '紅蓮華 (Demon Slayer)',
            notes: [
                { freq: 329.63, duration: 0.2 },
                { freq: 329.63, duration: 0.2 },
                { freq: 392.00, duration: 0.25 },
                { freq: 440.00, duration: 0.25 },
                { freq: 493.88, duration: 0.35 },
                { freq: 440.00, duration: 0.25 },
                { freq: 392.00, duration: 0.4 },
            ],
        },
    ];

    const playPreset = async (preset: PresetMelody) => {
        if (isPlayingPreset) return;
        setIsPlayingPreset(true);

        for (const note of preset.notes) {
            playTone(note.freq, note.duration);
            await new Promise((r) => setTimeout(r, note.duration * 1000 + 60));
        }

        setIsPlayingPreset(false);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isSynthOpen) return;
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            if (e.key === 'Escape') {
                handleClose();
                return;
            }

            const k = e.key.toUpperCase();
            const targetKey = keys.find((item) => item.keyLabel === k);
            if (targetKey) {
                handleKeyPlay(targetKey.note, targetKey.semi);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isSynthOpen, octave, waveType, handleClose]);

    if (!isSynthOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6 backdrop-blur-2xl animate-in fade-in duration-200 select-none">
            <div className="relative flex flex-col w-full max-w-3xl rounded-3xl border border-purple-500/30 bg-gradient-to-b from-[#140e22]/95 to-[#07050d]/95 p-6 md:p-8 shadow-2xl backdrop-blur-2xl">
                <button
                    onClick={handleClose}
                    className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all"
                >
                    ✕
                </button>

                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-purple-500/20 pb-4 mb-6 gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="rounded-full bg-purple-500/20 border border-purple-400/40 px-3 py-0.5 text-xs font-bold text-purple-300 uppercase tracking-widest">
                                Studio Synth
                            </span>
                            <span className="text-xs font-mono text-white/50">
                                13-Key Web Audio Engine
                            </span>
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight mt-1">
                            Anime Melody Synthesizer
                        </h2>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center rounded-xl border border-white/15 bg-black/40 p-1">
                            {(['sine', 'triangle', 'sawtooth', 'square'] as const).map((w) => (
                                <button
                                    key={w}
                                    onClick={() => setWaveType(w)}
                                    className={`rounded-lg px-2.5 py-1 text-[11px] font-mono uppercase font-bold transition-all ${
                                        waveType === w
                                            ? 'bg-purple-500 text-white shadow-md'
                                            : 'text-white/50 hover:text-white'
                                    }`}
                                >
                                    {w}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center rounded-xl border border-white/15 bg-black/40 p-1">
                            <button
                                onClick={() => setOctave(Math.max(2, octave - 1))}
                                className="px-2 py-0.5 text-xs text-white/60 hover:text-white font-mono"
                            >
                                -
                            </button>
                            <span className="px-2 text-xs font-mono font-bold text-purple-300">
                                Oct {octave}
                            </span>
                            <button
                                onClick={() => setOctave(Math.min(6, octave + 1))}
                                className="px-2 py-0.5 text-xs text-white/60 hover:text-white font-mono"
                            >
                                +
                            </button>
                        </div>
                    </div>
                </div>

                <div className="relative h-44 w-full flex justify-center bg-black/60 rounded-2xl p-4 border border-white/10 shadow-inner overflow-hidden">
                    <div className="relative flex h-full">
                        {keys.map((k) => {
                            if (k.isBlack) return null;
                            const isPressed = activeKey === k.note;
                            return (
                                <button
                                    key={k.note}
                                    onClick={() => handleKeyPlay(k.note, k.semi)}
                                    className={`relative w-12 md:w-14 h-full rounded-b-xl border border-black/30 flex flex-col justify-end items-center pb-2 transition-all shadow-md active:translate-y-1 ${
                                        isPressed
                                            ? 'bg-purple-400 text-black'
                                            : 'bg-white hover:bg-zinc-100 text-black'
                                    }`}
                                >
                                    <span className="text-[10px] font-bold font-mono text-black/50">
                                        [{k.keyLabel}]
                                    </span>
                                    <span className="text-xs font-black">{k.note}</span>
                                </button>
                            );
                        })}

                        <div className="absolute top-0 left-0 flex pointer-events-none w-full h-28">
                            {keys.map((k, idx) => {
                                if (!k.isBlack) return null;
                                const isPressed = activeKey === k.note;
                                const leftOffsets: Record<number, number> = {
                                    1: 36,
                                    3: 86,
                                    6: 190,
                                    8: 242,
                                    10: 294,
                                };
                                const leftPos = leftOffsets[idx] || 0;

                                return (
                                    <button
                                        key={k.note}
                                        style={{ left: `${leftPos}px` }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleKeyPlay(k.note, k.semi);
                                        }}
                                        className={`pointer-events-auto absolute top-0 w-8 md:w-9 h-28 rounded-b-lg border border-black z-20 flex flex-col justify-end items-center pb-1.5 transition-all shadow-xl active:translate-y-1 ${
                                            isPressed
                                                ? 'bg-purple-500 text-white'
                                                : 'bg-[#18141f] hover:bg-[#251e30] text-white'
                                        }`}
                                    >
                                        <span className="text-[9px] font-mono font-bold text-purple-300">
                                            [{k.keyLabel}]
                                        </span>
                                        <span className="text-[10px] font-bold">{k.note}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10">
                    <h4 className="text-xs font-bold text-white/60 uppercase tracking-wider mb-3">
                        Anime Theme Presets
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                        {presets.map((p) => (
                            <button
                                key={p.name}
                                disabled={isPlayingPreset}
                                onClick={() => playPreset(p)}
                                className="group flex flex-col p-3 rounded-xl border border-white/10 bg-white/5 hover:border-purple-400/50 hover:bg-purple-500/10 transition-all text-left disabled:opacity-50"
                            >
                                <span className="text-xs font-bold text-white group-hover:text-purple-300 truncate">
                                    {p.name}
                                </span>
                                <span className="text-[10px] text-white/40 truncate mt-0.5">
                                    {p.jp}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
