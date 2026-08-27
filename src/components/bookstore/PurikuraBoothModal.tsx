'use client';

import { useBookstoreStore } from '@/store/bookstoreStore';
import { useCallback, useEffect, useRef, useState } from 'react';

interface Stamp {
    id: string;
    label: string;
    text: string;
}

interface PlacedStamp {
    id: string;
    text: string;
    x: number;
    y: number;
}

export default function PurikuraBoothModal() {
    const { isPurikuraOpen, setPurikuraOpen, isAudioPlaying } = useBookstoreStore();
    const [filter, setFilter] = useState<string>('soft-glow');
    const [stamps, setStamps] = useState<PlacedStamp[]>([]);
    const [selectedStamp, setSelectedStamp] = useState<string>('KAWAII');
    const [penColor, setPenColor] = useState<string>('#f472b6');
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);

    const stampOptions: Stamp[] = [
        { id: 'kawaii', label: 'Kawaii', text: 'かわいい' },
        { id: 'suki', label: 'Love', text: '大好き' },
        { id: 'friends', label: 'BFF', text: '親友' },
        { id: 'star', label: 'Star', text: '★' },
        { id: 'sparkle', label: 'Sparkle', text: '✦' },
        { id: 'heart', label: 'Heart', text: '♥' },
    ];

    const filterPresets = [
        { id: 'soft-glow', name: 'Soft Pastel Glow', bg: 'from-pink-900/60 to-purple-900/60' },
        { id: 'vintage-anime', name: '90s Cel Shaded', bg: 'from-amber-900/60 to-rose-900/60' },
        { id: 'cyber-neon', name: 'Akiba Neon Cyber', bg: 'from-cyan-900/60 to-indigo-900/60' },
        { id: 'sakura-breeze', name: 'Sakura Petals', bg: 'from-rose-900/60 to-pink-950/60' },
    ];

    const handleClose = useCallback(() => {
        setPurikuraOpen(false);
    }, [setPurikuraOpen]);

    const playShutterSound = () => {
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

        osc.type = 'square';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.08);

        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.12);
    };

    const playPopSound = () => {
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
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.12);
    };

    const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const currentStampObj = stampOptions.find((s) => s.id === selectedStamp) || stampOptions[0];
        playPopSound();
        setStamps((prev) => [
            ...prev,
            { id: Math.random().toString(), text: currentStampObj.text, x, y },
        ]);
    };

    const handleClearStamps = () => {
        setStamps([]);
    };

    const handlePrint = () => {
        playShutterSound();
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isPurikuraOpen) {
                handleClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPurikuraOpen, handleClose]);

    if (!isPurikuraOpen) return null;

    const currentFilterObj = filterPresets.find((f) => f.id === filter) || filterPresets[0];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 md:p-6 backdrop-blur-2xl animate-in fade-in duration-200 select-none">
            <div className="relative flex flex-col w-full max-w-3xl rounded-3xl border border-pink-500/30 bg-gradient-to-b from-[#240a1c]/95 to-[#0b020c]/95 p-6 md:p-8 shadow-2xl backdrop-blur-2xl">
                <button
                    onClick={handleClose}
                    className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all"
                >
                    ✕
                </button>

                <div className="flex items-center gap-3 border-b border-pink-500/20 pb-4 mb-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-500/20 border border-pink-400/40 text-pink-300 font-bold font-mono">
                        PRI
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-white">
                            Tokyo Purikura Photo Sticker Studio
                        </h2>
                        <p className="text-xs text-pink-400 font-medium">
                            Floor 2 Screening Lounge • Kawaii Stamps & Print Stickers
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 flex flex-col items-center">
                        <div
                            onClick={handleCanvasClick}
                            className={`relative w-full aspect-[4/3] rounded-2xl border-4 border-pink-400/40 bg-gradient-to-br ${currentFilterObj.bg} overflow-hidden cursor-crosshair shadow-2xl flex flex-col items-center justify-center p-6 text-center`}
                        >
                            <div className="absolute inset-4 border-2 border-dashed border-pink-300/40 rounded-xl pointer-events-none" />
                            <div className="z-10 text-white/90">
                                <span className="font-mono text-[11px] tracking-widest text-pink-300 uppercase block mb-1">
                                    NANIMO MEMORIAL PHOTO
                                </span>
                                <h3 className="text-2xl md:text-3xl font-black tracking-wide text-white drop-shadow">
                                    秋葉原ステッカー
                                </h3>
                                <p className="text-xs text-pink-200/80 mt-1 font-mono">
                                    Click anywhere inside frame to place stamps
                                </p>
                            </div>

                            {stamps.map((s) => (
                                <div
                                    key={s.id}
                                    style={{ left: s.x - 20, top: s.y - 20 }}
                                    className="absolute pointer-events-none text-2xl font-black text-pink-300 drop-shadow-[0_0_8px_rgba(244,114,182,0.8)] animate-in zoom-in-50 duration-150"
                                >
                                    {s.text}
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center justify-between w-full mt-3 text-xs">
                            <span className="text-white/50 font-mono">
                                Placed Stamps: {stamps.length}
                            </span>
                            <button
                                onClick={handleClearStamps}
                                className="text-pink-400 hover:text-pink-300 font-medium transition-colors"
                            >
                                Clear All Stamps
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col space-y-4">
                        <div>
                            <label className="text-[11px] font-mono uppercase tracking-wider text-pink-300 block mb-2 font-bold">
                                Select Kawaii Stamp
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {stampOptions.map((s) => (
                                    <button
                                        key={s.id}
                                        onClick={() => setSelectedStamp(s.id)}
                                        className={`p-2 rounded-xl border text-center transition-all ${
                                            selectedStamp === s.id
                                                ? 'border-pink-400 bg-pink-500/30 text-white font-bold ring-1 ring-pink-400'
                                                : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                                        }`}
                                    >
                                        <div className="text-base">{s.text}</div>
                                        <div className="text-[10px] font-mono mt-0.5">{s.label}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-[11px] font-mono uppercase tracking-wider text-pink-300 block mb-2 font-bold">
                                Atmosphere Filter
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {filterPresets.map((f) => (
                                    <button
                                        key={f.id}
                                        onClick={() => setFilter(f.id)}
                                        className={`p-2 rounded-xl border text-left transition-all ${
                                            filter === f.id
                                                ? 'border-pink-400 bg-pink-500/20 text-white ring-1 ring-pink-400'
                                                : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                                        }`}
                                    >
                                        <span className="text-[11px] font-bold block truncate">
                                            {f.name}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                onClick={handlePrint}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold uppercase tracking-wider text-xs shadow-lg hover:from-pink-400 hover:to-rose-400 transition-all shadow-pink-500/20"
                            >
                                Print Purikura Sticker Sheet
                            </button>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleClose}
                    className="mt-6 w-full py-2.5 rounded-xl bg-white/10 border border-white/15 text-white font-bold uppercase tracking-wider text-xs hover:bg-white/20 transition-all"
                >
                    Exit Photo Booth
                </button>
            </div>
        </div>
    );
}
