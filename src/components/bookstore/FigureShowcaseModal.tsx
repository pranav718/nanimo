'use client';

import { useBookstoreStore } from '@/store/bookstoreStore';
import { useCallback, useEffect, useRef, useState } from 'react';

interface AnimeFigure {
    id: string;
    title: string;
    character: string;
    series: string;
    scale: string;
    rarity: 'SSR' | 'UR' | 'SPEC';
    sculptor: string;
    description: string;
    accentColor: string;
}

export default function FigureShowcaseModal() {
    const { isFigureShowcaseOpen, setFigureShowcaseOpen, isAudioPlaying } = useBookstoreStore();
    const [selectedFigureIdx, setSelectedFigureIdx] = useState<number>(0);
    const [rotation, setRotation] = useState<number>(0);
    const [lightingOn, setLightingOn] = useState<boolean>(true);
    const audioCtxRef = useRef<AudioContext | null>(null);

    const figures: AnimeFigure[] = [
        {
            id: 'frieren',
            title: 'Frieren: Beyond Journey\'s End',
            character: 'Frieren the Slayer',
            series: 'Sousou no Frieren',
            scale: '1/7 Scale (28cm)',
            rarity: 'UR',
            sculptor: 'GoodSmile Arts Tokyo',
            description: 'Intricately sculpted ancient elven mage holding her bronze spell staff with flowing translucent twin tails.',
            accentColor: 'from-sky-500/30 border-sky-400',
        },
        {
            id: 'megumin',
            title: 'KonoSuba: God\'s Blessing',
            character: 'Megumin Explosion Witch',
            series: 'Kono Subarashii Sekai ni Shukufuku wo!',
            scale: '1/7 Scale (26cm)',
            rarity: 'SSR',
            sculptor: 'Kadokawa Special KDcolle',
            description: 'Dynamic crimson spell casting pose featuring Chomusuke familiar perched upon her wizard brim hat.',
            accentColor: 'from-rose-500/30 border-rose-400',
        },
        {
            id: 'spike',
            title: 'Cowboy Bebop',
            character: 'Spike Spiegel',
            series: 'Cowboy Bebop Noir',
            scale: '1/8 Scale (24cm)',
            rarity: 'SPEC',
            sculptor: 'Megahouse G.E.M.',
            description: 'Retro 90s aesthetic showcasing Jericho 941 pistol, billowing blue suit, and relaxed smoke pose.',
            accentColor: 'from-amber-500/30 border-amber-400',
        },
        {
            id: 'gojo',
            title: 'Jujutsu Kaisen',
            character: 'Gojo Satoru',
            series: 'Jujutsu Kaisen',
            scale: '1/6 Scale (32cm)',
            rarity: 'UR',
            sculptor: 'Shibuya Scramble Figure',
            description: 'Unlimited Void domain expansion edition with crystal resin aura ripples and unmasked Six Eyes.',
            accentColor: 'from-purple-500/30 border-purple-400',
        },
    ];

    const currentFigure = figures[selectedFigureIdx];

    const handleClose = useCallback(() => {
        setFigureShowcaseOpen(false);
    }, [setFigureShowcaseOpen]);

    const playClickSound = () => {
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
        osc.frequency.setValueAtTime(660, now);
        osc.frequency.exponentialRampToValueAtTime(1100, now + 0.06);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.1);
    };

    const handleRotate = () => {
        playClickSound();
        setRotation((prev) => (prev + 90) % 360);
    };

    const handleToggleLight = () => {
        playClickSound();
        setLightingOn((prev) => !prev);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isFigureShowcaseOpen) {
                handleClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isFigureShowcaseOpen, handleClose]);

    if (!isFigureShowcaseOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 md:p-6 backdrop-blur-2xl animate-in fade-in duration-200 select-none">
            <div className="relative flex flex-col w-full max-w-3xl rounded-3xl border border-sky-500/30 bg-gradient-to-b from-[#081324]/95 to-[#02050c]/95 p-6 md:p-8 shadow-2xl backdrop-blur-2xl">
                <button
                    onClick={handleClose}
                    className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all"
                >
                    ✕
                </button>

                <div className="flex items-center gap-3 border-b border-sky-500/20 pb-4 mb-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/20 border border-sky-400/40 text-sky-300 font-bold font-mono">
                        FIG
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-white">
                            Akihabara Scale Figure Showcase
                        </h2>
                        <p className="text-xs text-sky-400 font-medium">
                            Floor 2 Screening Lounge • Museum Quality Otaku Collector Gallery
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 flex flex-col items-center">
                        <div
                            className={`relative w-full aspect-[4/3] rounded-2xl border-2 border-white/15 bg-gradient-to-b from-black/80 to-[#0c1424] overflow-hidden flex flex-col items-center justify-center p-6 text-center shadow-inner ${
                                lightingOn ? 'ring-1 ring-sky-400/40' : ''
                            }`}
                        >
                            {lightingOn && (
                                <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-sky-400/20 to-transparent pointer-events-none" />
                            )}

                            <div
                                style={{ transform: `rotateY(${rotation}deg)` }}
                                className="transition-transform duration-500 flex flex-col items-center justify-center"
                            >
                                <div className="h-32 w-32 rounded-full border-4 border-dashed border-sky-400/40 flex items-center justify-center bg-sky-950/40 mb-3 shadow-2xl">
                                    <span className="font-mono text-xs font-black text-sky-300">
                                        {currentFigure.rarity} GRADE
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-white tracking-wide">
                                    {currentFigure.character}
                                </h3>
                                <span className="text-xs font-mono text-sky-400 mt-0.5">
                                    {currentFigure.scale}
                                </span>
                            </div>

                            <div className="absolute bottom-3 inset-x-6 flex items-center justify-between text-[11px] font-mono text-white/50">
                                <span>Angle: {rotation}°</span>
                                <span>Spotlight: {lightingOn ? 'ACTIVE' : 'OFF'}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full mt-4">
                            <button
                                onClick={handleRotate}
                                className="flex-1 py-2.5 rounded-xl border border-white/15 bg-white/5 text-xs font-mono text-white/80 hover:bg-white/10 hover:text-white transition-all"
                            >
                                Rotate 90°
                            </button>
                            <button
                                onClick={handleToggleLight}
                                className={`flex-1 py-2.5 rounded-xl border text-xs font-mono transition-all ${
                                    lightingOn
                                        ? 'border-sky-400 bg-sky-500/20 text-sky-300 font-bold'
                                        : 'border-white/15 bg-white/5 text-white/60 hover:text-white'
                                }`}
                            >
                                {lightingOn ? 'Spotlight: ON' : 'Spotlight: OFF'}
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col space-y-3">
                        <label className="text-[11px] font-mono uppercase tracking-wider text-sky-300 block font-bold">
                            Select Collector Figure
                        </label>
                        <div className="flex flex-col space-y-2">
                            {figures.map((f, idx) => (
                                <button
                                    key={f.id}
                                    onClick={() => {
                                        playClickSound();
                                        setSelectedFigureIdx(idx);
                                    }}
                                    className={`p-3 rounded-2xl border text-left transition-all ${
                                        selectedFigureIdx === idx
                                            ? 'border-sky-400 bg-sky-500/20 shadow-md ring-1 ring-sky-400'
                                            : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-mono font-bold text-sky-400">
                                            {f.series}
                                        </span>
                                        <span className="text-[9px] font-mono font-bold bg-white/10 px-1.5 py-0.5 rounded text-white/80">
                                            {f.rarity}
                                        </span>
                                    </div>
                                    <h4 className="text-xs font-bold text-white mt-1 truncate">
                                        {f.character}
                                    </h4>
                                </button>
                            ))}
                        </div>

                        <div className="bg-black/50 rounded-2xl p-4 border border-white/10 text-xs">
                            <span className="text-[10px] font-mono text-white/50 block mb-1">
                                SCULPTOR & NOTES
                            </span>
                            <p className="text-white/80 leading-relaxed font-sans text-[11px]">
                                {currentFigure.description}
                            </p>
                            <span className="text-[10px] font-mono text-sky-400/80 block mt-2">
                                Studio: {currentFigure.sculptor}
                            </span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleClose}
                    className="mt-6 w-full py-2.5 rounded-xl bg-white/10 border border-white/15 text-white font-bold uppercase tracking-wider text-xs hover:bg-white/20 transition-all"
                >
                    Close Showcase
                </button>
            </div>
        </div>
    );
}
