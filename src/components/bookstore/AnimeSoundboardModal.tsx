'use client';

import { useBookstoreStore } from '@/store/bookstoreStore';
import { useCallback, useEffect, useRef, useState } from 'react';

export default function AnimeSoundboardModal() {
    const { isSoundboardOpen, setSoundboardOpen } = useBookstoreStore();
    const [activePad, setActivePad] = useState<number | null>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);

    const handleClose = useCallback(() => {
        setSoundboardOpen(false);
    }, [setSoundboardOpen]);

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

    const playSound = (id: number) => {
        const ctx = getAudioContext();
        const now = ctx.currentTime;
        setActivePad(id);
        setTimeout(() => setActivePad(null), 200);

        if (id === 0) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(3200, now);
            osc.frequency.exponentialRampToValueAtTime(400, now + 0.15);
            gain.gain.setValueAtTime(0.06, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.2);
        } else if (id === 1) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1400, now);
            osc.frequency.exponentialRampToValueAtTime(80, now + 0.22);
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.26);
        } else if (id === 2) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const filter = ctx.createBiquadFilter();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(90, now);
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(120, now);
            filter.frequency.exponentialRampToValueAtTime(2400, now + 0.4);
            gain.gain.setValueAtTime(0.06, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.46);
        } else if (id === 3) {
            [220, 261.63, 311.13, 440].forEach((freq) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, now);
                gain.gain.setValueAtTime(0.05, now);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now);
                osc.stop(now + 1.25);
            });
        } else if (id === 4) {
            [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'square';
                osc.frequency.setValueAtTime(freq, now + idx * 0.08);
                gain.gain.setValueAtTime(0.03, now + idx * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.3);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now + idx * 0.08);
                osc.stop(now + idx * 0.08 + 0.32);
            });
        } else if (id === 5) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.exponentialRampToValueAtTime(600, now + 0.12);
            gain.gain.setValueAtTime(0.04, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.16);
        } else if (id === 6) {
            [880, 1174.66, 1396.91, 1760].forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + idx * 0.06);
                gain.gain.setValueAtTime(0.04, now + idx * 0.06);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.4);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now + idx * 0.06);
                osc.stop(now + idx * 0.06 + 0.45);
            });
        } else if (id === 7) {
            const bufSize = ctx.sampleRate * 0.5;
            const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
            const data = buf.getChannelData(0);
            for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
            const noise = ctx.createBufferSource();
            noise.buffer = buf;
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(800, now);
            filter.frequency.exponentialRampToValueAtTime(80, now + 0.45);
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);
            noise.start(now);
        }
    };

    const sfxList = [
        { name: 'Katana Slash', jp: '斬撃音 (Shing)', key: '1', color: 'from-rose-500 to-red-600' },
        { name: 'Instant Teleport', jp: '瞬間移動 (Zubatto)', key: '2', color: 'from-cyan-500 to-blue-600' },
        { name: 'Power Aura Surge', jp: 'オーラ解放 (Ki Charge)', key: '3', color: 'from-emerald-500 to-teal-600' },
        { name: 'Dramatic Piano', jp: '衝撃ピアノ (Gaan)', key: '4', color: 'from-purple-500 to-indigo-600' },
        { name: 'Level Up Fanfare', jp: 'ファンファーレ (Triumph)', key: '5', color: 'from-amber-400 to-orange-500' },
        { name: '8-Bit Jump', jp: 'ジャンプ音 (Chiptune)', key: '6', color: 'from-pink-500 to-rose-500' },
        { name: 'Magic Sparkle', jp: '魔法発動 (Spellcast)', key: '7', color: 'from-sky-400 to-indigo-500' },
        { name: 'Thunder Strike', jp: '雷撃 (Thunder Crash)', key: '8', color: 'from-yellow-400 to-amber-600' },
    ];

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isSoundboardOpen) return;
            if (e.key === 'Escape') {
                handleClose();
            } else {
                const num = parseInt(e.key, 10);
                if (num >= 1 && num <= 8) {
                    playSound(num - 1);
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isSoundboardOpen, handleClose]);

    if (!isSoundboardOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6 backdrop-blur-2xl animate-in fade-in duration-200 select-none">
            <div className="relative flex flex-col w-full max-w-2xl rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-[#091522]/95 to-[#04080e]/95 p-6 md:p-8 shadow-2xl backdrop-blur-2xl">
                <button
                    onClick={handleClose}
                    className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all"
                >
                    ✕
                </button>

                <div className="flex items-center gap-3 border-b border-cyan-500/20 pb-4 mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-bold font-mono">
                        SFX
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-white">
                            Anime Sound Effects Synthesizer
                        </h2>
                        <p className="text-xs text-cyan-400 font-medium">
                            Real-time Web Audio Synthesizer • Press Keys 1 to 8 or Click
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {sfxList.map((item, idx) => (
                        <button
                            key={idx}
                            onClick={() => playSound(idx)}
                            className={`group relative flex flex-col items-center justify-center p-5 rounded-2xl border transition-all text-center ${
                                activePad === idx
                                    ? 'border-white bg-white/20 scale-95 shadow-xl shadow-cyan-500/30'
                                    : 'border-white/10 bg-white/5 hover:border-cyan-400/60 hover:bg-white/10 hover:scale-105'
                            }`}
                        >
                            <span className="absolute top-2 left-3 text-[10px] font-mono font-bold text-white/40 group-hover:text-cyan-300">
                                [{item.key}]
                            </span>
                            <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${item.color} shadow-md mb-2 group-hover:scale-110 transition-transform`} />
                            <h4 className="text-xs font-bold text-white group-hover:text-cyan-200">
                                {item.name}
                            </h4>
                            <p className="text-[10px] text-white/40 mt-0.5">{item.jp}</p>
                        </button>
                    ))}
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10 text-xs text-white/40 font-mono">
                    <span>Synthesized on Web Audio API</span>
                    <span>Floor 2 Screening Lounge</span>
                </div>
            </div>
        </div>
    );
}
