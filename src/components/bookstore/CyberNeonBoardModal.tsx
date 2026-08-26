'use client';

import { useBookstoreStore } from '@/store/bookstoreStore';
import { useCallback, useEffect, useRef, useState } from 'react';

interface NeonPreset {
    id: string;
    text: string;
    textJp: string;
    color: string;
    glow: string;
}

export default function CyberNeonBoardModal() {
    const { isNeonBoardOpen, setNeonBoardOpen, isAudioPlaying } = useBookstoreStore();
    const [customText, setCustomText] = useState<string>('何も電脳書庫');
    const [selectedColor, setSelectedColor] = useState<string>('cyan');
    const audioCtxRef = useRef<AudioContext | null>(null);

    const presets: NeonPreset[] = [
        { id: 'archive', text: 'NANIMO ARCHIVE', textJp: '何も電脳書庫', color: 'text-cyan-400', glow: 'shadow-[0_0_25px_rgba(34,211,238,0.8)]' },
        { id: 'neotokyo', text: 'NEO TOKYO', textJp: '新東京電脳街', color: 'text-pink-500', glow: 'shadow-[0_0_25px_rgba(236,72,153,0.8)]' },
        { id: 'lounge', text: 'ANIME LOUNGE', textJp: 'アニソン音響空間', color: 'text-purple-400', glow: 'shadow-[0_0_25px_rgba(192,132,252,0.8)]' },
        { id: 'shinjuku', text: 'MIDNIGHT AKIBA', textJp: '秋葉原深夜営業', color: 'text-amber-400', glow: 'shadow-[0_0_25px_rgba(251,191,36,0.8)]' },
    ];

    const handleClose = useCallback(() => {
        setNeonBoardOpen(false);
    }, [setNeonBoardOpen]);

    const playBuzzSound = () => {
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
        osc.frequency.setValueAtTime(120, now);

        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.2);
    };

    const handleSelectPreset = (p: NeonPreset) => {
        playBuzzSound();
        setCustomText(p.textJp);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isNeonBoardOpen) {
                handleClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isNeonBoardOpen, handleClose]);

    if (!isNeonBoardOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6 backdrop-blur-2xl animate-in fade-in duration-200 select-none">
            <div className="relative flex flex-col w-full max-w-2xl rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-[#061824]/95 to-[#02090e]/95 p-6 md:p-8 shadow-2xl backdrop-blur-2xl">
                <button
                    onClick={handleClose}
                    className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all"
                >
                    ✕
                </button>

                <div className="flex items-center gap-3 border-b border-cyan-500/20 pb-4 mb-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-bold font-mono">
                        NEON
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-white">
                            Akiba Cyber Neon Marquee Customizer
                        </h2>
                        <p className="text-xs text-cyan-400 font-medium">
                            Floor 2 Screening Lounge • Glowing Kanji Wall Billboard
                        </p>
                    </div>
                </div>

                <div className="bg-black/90 rounded-2xl p-8 border border-white/10 mb-6 flex flex-col items-center justify-center min-h-[160px] text-center shadow-inner relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-pink-500/5 animate-pulse" />
                    <h3 className="text-4xl md:text-5xl font-black tracking-widest text-cyan-300 drop-shadow-[0_0_20px_rgba(34,211,238,0.9)] animate-pulse">
                        {customText || '何も'}
                    </h3>
                    <span className="font-mono text-[10px] text-cyan-400/60 mt-3 tracking-widest uppercase">
                        High Voltage Gas Discharge Tube Active
                    </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
                    {presets.map((p) => (
                        <button
                            key={p.id}
                            onClick={() => handleSelectPreset(p)}
                            className="p-2.5 rounded-xl border border-white/10 bg-white/5 hover:border-cyan-400 hover:bg-cyan-500/10 text-left transition-all"
                        >
                            <span className="text-[10px] font-mono font-bold text-cyan-300 block truncate">
                                {p.text}
                            </span>
                            <h4 className="text-xs font-bold text-white mt-0.5 truncate">
                                {p.textJp}
                            </h4>
                        </button>
                    ))}
                </div>

                <div className="mb-5">
                    <input
                        type="text"
                        value={customText}
                        onChange={(e) => setCustomText(e.target.value)}
                        placeholder="Type custom Japanese neon text..."
                        className="w-full px-4 py-2.5 rounded-xl border border-white/15 bg-black/50 text-white font-bold text-sm focus:border-cyan-400 focus:outline-none"
                    />
                </div>

                <button
                    onClick={handleClose}
                    className="w-full py-3 rounded-xl bg-cyan-400 text-black font-bold uppercase tracking-wider text-xs shadow-lg hover:bg-cyan-300 transition-all"
                >
                    Apply Neon Sign
                </button>
            </div>
        </div>
    );
}
