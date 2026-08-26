'use client';

import { useBookstoreStore } from '@/store/bookstoreStore';
import { useCallback, useEffect, useRef, useState } from 'react';

export default function TaikoDrumModal() {
    const { isTaikoOpen, setTaikoOpen, isAudioPlaying } = useBookstoreStore();
    const [combo, setCombo] = useState<number>(0);
    const [lastHit, setLastHit] = useState<'DON' | 'KA' | null>(null);
    const [score, setScore] = useState<number>(0);
    const audioCtxRef = useRef<AudioContext | null>(null);

    const handleClose = useCallback(() => {
        setTaikoOpen(false);
    }, [setTaikoOpen]);

    const playDrumSound = (type: 'DON' | 'KA') => {
        if (!isAudioPlaying) return;
        if (!audioCtxRef.current) {
            const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            audioCtxRef.current = new AudioCtx();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') ctx.resume();

        const now = ctx.currentTime;

        if (type === 'DON') {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(110, now);
            osc.frequency.exponentialRampToValueAtTime(40, now + 0.3);

            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 0.38);
        } else {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(480, now);
            osc.frequency.exponentialRampToValueAtTime(220, now + 0.1);

            gain.gain.setValueAtTime(0.09, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 0.15);
        }
    };

    const handleHit = (type: 'DON' | 'KA') => {
        playDrumSound(type);
        setLastHit(type);
        setCombo((prev) => prev + 1);
        setScore((prev) => prev + (type === 'DON' ? 100 : 80));
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isTaikoOpen) {
                handleClose();
            } else if (isTaikoOpen) {
                if (e.key === 'f' || e.key === 'F' || e.key === 'j' || e.key === 'J') {
                    handleHit('DON');
                } else if (e.key === 'd' || e.key === 'D' || e.key === 'k' || e.key === 'K') {
                    handleHit('KA');
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isTaikoOpen, handleClose]);

    if (!isTaikoOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6 backdrop-blur-2xl animate-in fade-in duration-200 select-none">
            <div className="relative flex flex-col w-full max-w-2xl rounded-3xl border border-red-500/30 bg-gradient-to-b from-[#240808]/95 to-[#0b0202]/95 p-6 md:p-8 shadow-2xl backdrop-blur-2xl">
                <button
                    onClick={handleClose}
                    className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all"
                >
                    ✕
                </button>

                <div className="flex items-center gap-3 border-b border-red-500/20 pb-4 mb-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/20 border border-red-400/40 text-red-300 font-bold font-mono">
                        TAIKO
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-white">
                            Traditional Japanese Taiko Drum
                        </h2>
                        <p className="text-xs text-red-400 font-medium">
                            Floor 3 Observatory • Festival Rhythm Percussion
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-between bg-black/60 p-4 rounded-2xl border border-white/10 mb-6 font-mono">
                    <div>
                        <span className="text-[10px] text-white/50 block">PERCUSSION SCORE</span>
                        <span className="text-2xl font-black text-amber-300">{score.toLocaleString()} pts</span>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] text-white/50 block">DRUM COMBO</span>
                        <span className="text-2xl font-black text-red-400">{combo} Hits</span>
                    </div>
                </div>

                <div className="relative flex items-center justify-center py-6 mb-6">
                    <div className="relative flex items-center justify-center h-48 w-48 rounded-full border-8 border-red-700 bg-amber-100 shadow-2xl">
                        <button
                            onClick={() => handleHit('DON')}
                            className="h-32 w-32 rounded-full bg-red-600 border-4 border-red-800 text-white font-black text-xl flex flex-col items-center justify-center shadow-inner hover:scale-105 active:scale-95 transition-all"
                        >
                            <span>DON</span>
                            <span className="text-[10px] font-mono opacity-80">(F / J Key)</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-5">
                    <button
                        onClick={() => handleHit('KA')}
                        className="py-3 rounded-xl border border-blue-400/40 bg-blue-500/20 text-blue-300 font-bold uppercase tracking-wider text-xs hover:bg-blue-500/30 transition-all"
                    >
                        Rim Strike: KA (D / K Key)
                    </button>
                    <button
                        onClick={() => handleHit('DON')}
                        className="py-3 rounded-xl bg-red-600 text-white font-bold uppercase tracking-wider text-xs shadow-lg hover:bg-red-500 transition-all"
                    >
                        Center Strike: DON (F / J Key)
                    </button>
                </div>

                <button
                    onClick={handleClose}
                    className="w-full py-2.5 rounded-xl bg-white/10 border border-white/15 text-white font-bold uppercase tracking-wider text-xs hover:bg-white/20 transition-all"
                >
                    Close Taiko Drum
                </button>
            </div>
        </div>
    );
}
