'use client';

import { useBookstoreStore } from '@/store/bookstoreStore';
import { useCallback, useEffect, useRef, useState } from 'react';

interface MetroCardSkin {
    id: string;
    name: string;
    type: string;
    gradient: string;
    accent: string;
    character: string;
}

export default function TokyoMetroCardModal() {
    const { isMetroCardOpen, setMetroCardOpen, isAudioPlaying } = useBookstoreStore();
    const [balance, setBalance] = useState<number>(2480);
    const [selectedSkin, setSelectedSkin] = useState<string>('suica_penguin');
    const [lastTapStation, setLastTapStation] = useState<string>('Akihabara Station (秋葉原)');
    const audioCtxRef = useRef<AudioContext | null>(null);

    const skins: MetroCardSkin[] = [
        { id: 'suica_penguin', name: 'Nanimo Suica IC', type: 'Suica', gradient: 'from-emerald-600 via-teal-700 to-green-900', accent: 'border-emerald-400', character: 'SUICA' },
        { id: 'pasmo_pink', name: 'Tokyo Pasmo Pass', type: 'Pasmo', gradient: 'from-pink-600 via-rose-700 to-red-900', accent: 'border-pink-400', character: 'PASMO' },
        { id: 'akiba_cyber', name: 'Akiba Neon Cyber', type: 'Special', gradient: 'from-purple-600 via-indigo-700 to-violet-950', accent: 'border-purple-400', character: 'CYBER' },
        { id: 'shibuya_gold', name: 'Shibuya Gold VIP', type: 'Gold', gradient: 'from-amber-500 via-yellow-600 to-amber-900', accent: 'border-amber-400', character: 'GOLD' },
    ];

    const handleClose = useCallback(() => {
        setMetroCardOpen(false);
    }, [setMetroCardOpen]);

    const playPipSound = () => {
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

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1760, now);
        osc.frequency.setValueAtTime(2637, now + 0.08);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.24);
    };

    const handleTopUp = (amount: number) => {
        playPipSound();
        setBalance((prev) => prev + amount);
    };

    const stations = [
        'Akihabara (秋葉原)',
        'Shinjuku (新宿)',
        'Shibuya (渋谷)',
        'Harajuku (原宿)',
        'Ikebukuro (池袋)',
        'Ueno (上野)',
    ];

    const handleSimulateTap = (station: string) => {
        if (balance >= 180) {
            playPipSound();
            setBalance((prev) => prev - 180);
            setLastTapStation(station);
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isMetroCardOpen) {
                handleClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isMetroCardOpen, handleClose]);

    if (!isMetroCardOpen) return null;

    const currentSkin = skins.find((s) => s.id === selectedSkin) || skins[0];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6 backdrop-blur-2xl animate-in fade-in duration-200 select-none">
            <div className="relative flex flex-col w-full max-w-2xl rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-[#0a1f18]/95 to-[#040d0a]/95 p-6 md:p-8 shadow-2xl backdrop-blur-2xl">
                <button
                    onClick={handleClose}
                    className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all"
                >
                    ✕
                </button>

                <div className="flex items-center gap-3 border-b border-emerald-500/20 pb-4 mb-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-bold font-mono">
                        IC
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-white">
                            Tokyo Metro Commuter IC Pass
                        </h2>
                        <p className="text-xs text-emerald-400 font-medium">
                            Floor 1 Subway Station Gate • Transit Card & Route Pass
                        </p>
                    </div>
                </div>

                <div className={`relative w-full rounded-2xl p-6 mb-5 bg-gradient-to-tr ${currentSkin.gradient} border ${currentSkin.accent} shadow-xl flex flex-col justify-between h-44 overflow-hidden`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-black tracking-widest text-white bg-black/30 px-2 py-0.5 rounded">
                                {currentSkin.type}
                            </span>
                            <span className="text-xs font-semibold text-white/90">
                                {currentSkin.name}
                            </span>
                        </div>
                        <span className="font-mono text-sm font-bold text-white/70">
                            IC
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-[10px] text-white/60 font-mono block">STORED FARE BALANCE</span>
                            <span className="text-3xl font-black font-mono text-white tracking-tight">
                                ¥{balance.toLocaleString()}
                            </span>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] text-white/60 font-mono block">LAST TAP GATE</span>
                            <span className="text-xs font-bold text-white">
                                {lastTapStation}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
                    {skins.map((s) => (
                        <button
                            key={s.id}
                            onClick={() => setSelectedSkin(s.id)}
                            className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                                selectedSkin === s.id
                                    ? `${s.accent} bg-white/10 text-white ring-1 ring-white/40`
                                    : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10'
                            }`}
                        >
                            {s.name}
                        </button>
                    ))}
                </div>

                <div className="bg-black/60 rounded-2xl p-4 border border-white/10 mb-5">
                    <span className="text-[10px] font-mono text-white/50 uppercase block mb-2">
                        Simulate Gate Tap (-¥180):
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                        {stations.map((st) => (
                            <button
                                key={st}
                                onClick={() => handleSimulateTap(st)}
                                className="py-2 px-2.5 rounded-lg border border-white/10 bg-white/5 text-[11px] font-semibold text-white/80 hover:border-emerald-400 hover:bg-emerald-500/20 hover:text-white transition-all text-center truncate"
                            >
                                {st}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => handleTopUp(1000)}
                        className="w-1/2 py-2.5 rounded-xl bg-emerald-500 text-black font-bold uppercase tracking-wider text-xs shadow-lg hover:bg-emerald-400 transition-all"
                    >
                        Top Up +¥1,000
                    </button>
                    <button
                        onClick={() => handleTopUp(3000)}
                        className="w-1/2 py-2.5 rounded-xl bg-emerald-600 text-white font-bold uppercase tracking-wider text-xs shadow-lg hover:bg-emerald-500 transition-all"
                    >
                        Top Up +¥3,000
                    </button>
                </div>
            </div>
        </div>
    );
}
