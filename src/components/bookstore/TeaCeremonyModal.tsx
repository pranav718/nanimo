'use client';

import { useBookstoreStore } from '@/store/bookstoreStore';
import { useCallback, useEffect, useRef, useState } from 'react';

export default function TeaCeremonyModal() {
    const { isTeaCeremonyOpen, setTeaCeremonyOpen, isAudioPlaying } = useBookstoreStore();
    const [step, setStep] = useState<number>(1);
    const [frothProgress, setFrothProgress] = useState<number>(0);
    const [calmLevel, setCalmLevel] = useState<number>(40);
    const audioCtxRef = useRef<AudioContext | null>(null);

    const handleClose = useCallback(() => {
        setTeaCeremonyOpen(false);
    }, [setTeaCeremonyOpen]);

    const playWhiskSound = () => {
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
        osc.frequency.setValueAtTime(240, now);
        osc.frequency.exponentialRampToValueAtTime(360, now + 0.08);

        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.12);
    };

    const handleWhisk = () => {
        playWhiskSound();
        setFrothProgress((prev) => {
            const next = Math.min(100, prev + 15);
            if (next >= 100 && step === 3) {
                setStep(4);
            }
            return next;
        });
        setCalmLevel((prev) => Math.min(100, prev + 8));
    };

    const nextStep = () => {
        playWhiskSound();
        if (step < 4) {
            setStep((prev) => prev + 1);
        } else {
            setStep(1);
            setFrothProgress(0);
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isTeaCeremonyOpen) {
                handleClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isTeaCeremonyOpen, handleClose]);

    if (!isTeaCeremonyOpen) return null;

    const steps = [
        {
            num: 1,
            title: 'Purify Ceramic Chawan',
            titleJp: '茶碗清め',
            desc: 'Gently rinse and pre-warm the handcrafted Raku-ware tea bowl with hot spring water.',
        },
        {
            num: 2,
            title: 'Scoop Uji Matcha Powder',
            titleJp: '抹茶掬い',
            desc: 'Measure two bamboo scoops (Chashaku) of vibrant stone-ground ceremonial matcha from Uji, Kyoto.',
        },
        {
            num: 3,
            title: 'Whisk with Bamboo Chasen',
            titleJp: '茶筅泡立て',
            desc: 'Use rapid wrist motions in a W-pattern to whisk the matcha into a fine, jade-green velvet microfoam.',
        },
        {
            num: 4,
            title: 'Savor Wagashi & Drink',
            titleJp: '和菓子と一服',
            desc: 'Partake in seasonal sakura nerikiri wagashi confectionery to complement the rich umami of the tea.',
        },
    ];

    const currentStepInfo = steps[step - 1];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 md:p-6 backdrop-blur-2xl animate-in fade-in duration-200 select-none">
            <div className="relative flex flex-col w-full max-w-3xl rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-[#082414]/95 to-[#020b05]/95 p-6 md:p-8 shadow-2xl backdrop-blur-2xl">
                <button
                    onClick={handleClose}
                    className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all"
                >
                    ✕
                </button>

                <div className="flex items-center gap-3 border-b border-emerald-500/20 pb-4 mb-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-bold font-mono">
                        CHA
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-white">
                            Traditional Japanese Chanoyu Tea Ceremony
                        </h2>
                        <p className="text-xs text-emerald-400 font-medium">
                            Floor 3 Observatory • Uji Ceremonial Matcha & Wagashi Pairing
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 flex flex-col items-center">
                        <div className="relative w-full aspect-[4/3] rounded-2xl border-2 border-white/15 bg-gradient-to-b from-[#03150b] to-black/80 flex flex-col items-center justify-center p-6 text-center shadow-inner overflow-hidden">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.15)_0%,transparent_70%)] pointer-events-none" />

                            <div className="h-40 w-40 rounded-full border-8 border-amber-950/80 bg-[#15803d] flex flex-col items-center justify-center shadow-2xl relative">
                                <div
                                    style={{ opacity: 0.3 + (frothProgress / 100) * 0.7 }}
                                    className="absolute inset-2 rounded-full border-4 border-dashed border-emerald-300/40 bg-emerald-600 transition-opacity duration-300 flex items-center justify-center"
                                >
                                    <span className="font-mono text-[10px] text-white font-bold uppercase tracking-wider">
                                        {frothProgress >= 100 ? 'Velvet Foam Ready' : `${frothProgress}% Froth`}
                                    </span>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-white tracking-wide mt-4">
                                {currentStepInfo.titleJp} • {currentStepInfo.title}
                            </h3>
                            <p className="text-xs text-white/70 max-w-sm mt-1.5 leading-relaxed">
                                {currentStepInfo.desc}
                            </p>
                        </div>

                        <div className="flex items-center gap-3 w-full mt-4">
                            {step === 3 ? (
                                <button
                                    onClick={handleWhisk}
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold uppercase tracking-wider text-xs shadow-lg hover:from-emerald-400 hover:to-teal-400 transition-all shadow-emerald-500/20"
                                >
                                    Whisk with Chasen (Click Fast!)
                                </button>
                            ) : (
                                <button
                                    onClick={nextStep}
                                    className="w-full py-3 rounded-xl bg-emerald-500 text-black font-bold uppercase tracking-wider text-xs shadow-lg hover:bg-emerald-400 transition-all"
                                >
                                    {step === 4 ? 'Begin New Ceremony' : 'Proceed to Next Ritual Step'}
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col space-y-4">
                        <div>
                            <label className="text-[11px] font-mono uppercase tracking-wider text-emerald-300 block mb-2 font-bold">
                                Ceremony Progression
                            </label>
                            <div className="flex flex-col space-y-2">
                                {steps.map((s) => (
                                    <div
                                        key={s.num}
                                        className={`p-2.5 rounded-xl border transition-all ${
                                            step === s.num
                                                ? 'border-emerald-400 bg-emerald-500/20 shadow-md ring-1 ring-emerald-400'
                                                : step > s.num
                                                ? 'border-emerald-500/30 bg-emerald-950/20 text-white/50'
                                                : 'border-white/10 bg-white/5 text-white/40'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-mono font-bold text-emerald-400">
                                                Step 0{s.num}
                                            </span>
                                            <span className="text-[10px] font-mono">
                                                {s.titleJp}
                                            </span>
                                        </div>
                                        <h4 className="text-xs font-bold text-white mt-0.5">
                                            {s.title}
                                        </h4>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-black/60 rounded-2xl p-4 border border-white/10 text-xs">
                            <span className="text-[10px] font-mono text-emerald-400/80 block mb-1">
                                MINDFUL CALM INDEX
                            </span>
                            <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden mb-2">
                                <div
                                    style={{ width: `${calmLevel}%` }}
                                    className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all duration-300"
                                />
                            </div>
                            <span className="text-[10px] font-mono text-white/60">
                                Zen State: {calmLevel}% Peaceful
                            </span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleClose}
                    className="mt-6 w-full py-2.5 rounded-xl bg-white/10 border border-white/15 text-white font-bold uppercase tracking-wider text-xs hover:bg-white/20 transition-all"
                >
                    Leave Tea Ceremony
                </button>
            </div>
        </div>
    );
}
