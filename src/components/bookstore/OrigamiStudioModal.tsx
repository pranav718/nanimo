'use client';

import { useBookstoreStore } from '@/store/bookstoreStore';
import { useCallback, useEffect, useRef, useState } from 'react';

interface OrigamiModel {
    id: string;
    name: string;
    nameJp: string;
    difficulty: string;
    steps: string[];
    color: string;
}

interface WashiPattern {
    id: string;
    name: string;
    color: string;
}

export default function OrigamiStudioModal() {
    const { isOrigamiOpen, setOrigamiOpen, isAudioPlaying } = useBookstoreStore();
    const [selectedModel, setSelectedModel] = useState<number>(0);
    const [selectedPattern, setSelectedPattern] = useState<string>('sakura');
    const [currentStep, setCurrentStep] = useState<number>(0);
    const audioCtxRef = useRef<AudioContext | null>(null);

    const models: OrigamiModel[] = [
        {
            id: 'crane',
            name: 'Orizuru Paper Crane',
            nameJp: '折鶴 (Senbazuru)',
            difficulty: 'Intermediate',
            steps: [
                'Fold paper in half diagonally to form a triangle, then fold again into a smaller triangle.',
                'Open one flap and squash fold into a neat diamond square base.',
                'Petal fold both outer edges toward the center vertical crease.',
                'Inside reverse fold both lower points upward to shape the slender neck and tail.',
                'Fold the tip down into a crane head and gently spread both wings outward.',
            ],
            color: 'text-amber-400',
        },
        {
            id: 'shuriken',
            name: 'Ninja Shuriken Star',
            nameJp: '手裏剣 (Four-Point Star)',
            difficulty: 'Beginner',
            steps: [
                'Take two square papers and fold each into horizontal rectangular strips.',
                'Fold the top and bottom corners into opposite 45-degree angle triangles.',
                'Interlock the two modules across each other in a cross formation.',
                'Tuck each triangular flap tightly into the opposite module pocket.',
            ],
            color: 'text-sky-400',
        },
        {
            id: 'kitsune',
            name: 'Inari Kitsune Fox Mask',
            nameJp: '狐面 (Mystic Guardian)',
            difficulty: 'Advanced',
            steps: [
                'Valley fold square paper diagonally across both center axes.',
                'Fold bottom corner up toward center to create the fox snout base.',
                'Angle fold both top corners outward to create two pointy fox ears.',
                'Mountain fold side edges backward to sculpt the cheek contours.',
                'Crease center bridge to give the fox mask 3D dimensional depth.',
            ],
            color: 'text-rose-400',
        },
        {
            id: 'kabuto',
            name: 'Samurai Kabuto Helmet',
            nameJp: '兜 (Warrior Helm)',
            difficulty: 'Beginner',
            steps: [
                'Fold square paper diagonally into a downward-pointing triangle.',
                'Fold both upper corners down to meet at the bottom point.',
                'Fold bottom flaps up to the top point, then wing outward for helmet horns.',
                'Fold the bottom triangle upward to form the brow band.',
                'Open bottom base to wear or display the finished samurai helmet.',
            ],
            color: 'text-emerald-400',
        },
    ];

    const patterns: WashiPattern[] = [
        { id: 'sakura', name: 'Sakura Blossom Washi', color: 'bg-rose-500/30 border-rose-400' },
        { id: 'indigo', name: 'Indigo Seigaiha Waves', color: 'bg-blue-600/30 border-blue-400' },
        { id: 'gold', name: 'Gold Leaf Karakusa', color: 'bg-amber-500/30 border-amber-400' },
        { id: 'cyber', name: 'Akiba Neon Cyber', color: 'bg-purple-600/30 border-purple-400' },
    ];

    const handleClose = useCallback(() => {
        setOrigamiOpen(false);
    }, [setOrigamiOpen]);

    const playCreaseSound = () => {
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

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320 + currentStep * 60, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.12);

        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.15);
    };

    const nextStep = () => {
        const total = models[selectedModel].steps.length;
        if (currentStep < total - 1) {
            playCreaseSound();
            setCurrentStep((prev) => prev + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            playCreaseSound();
            setCurrentStep((prev) => prev - 1);
        }
    };

    const resetSteps = (index: number) => {
        setSelectedModel(index);
        setCurrentStep(0);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOrigamiOpen) {
                handleClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOrigamiOpen, handleClose]);

    if (!isOrigamiOpen) return null;

    const currentM = models[selectedModel];
    const isFinished = currentStep === currentM.steps.length - 1;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6 backdrop-blur-2xl animate-in fade-in duration-200 select-none">
            <div className="relative flex flex-col w-full max-w-2xl rounded-3xl border border-rose-500/30 bg-gradient-to-b from-[#240e14]/95 to-[#0b0406]/95 p-6 md:p-8 shadow-2xl backdrop-blur-2xl">
                <button
                    onClick={handleClose}
                    className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all"
                >
                    ✕
                </button>

                <div className="flex items-center gap-3 border-b border-rose-500/20 pb-4 mb-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/20 border border-rose-400/40 text-rose-300 font-bold font-mono">
                        ORIGAMI
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-white">
                            Traditional Origami Paper Craft Studio
                        </h2>
                        <p className="text-xs text-rose-400 font-medium">
                            Floor 1 Manga Crafts • Interactive Japanese Washi Folding
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
                    {models.map((m, idx) => (
                        <button
                            key={m.id}
                            onClick={() => resetSteps(idx)}
                            className={`flex flex-col p-3 rounded-2xl border text-left transition-all ${
                                selectedModel === idx
                                    ? 'border-rose-400 bg-rose-500/20 shadow-md ring-1 ring-rose-400'
                                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                            }`}
                        >
                            <span className="text-[10px] font-mono font-bold text-rose-300">
                                {m.nameJp.split(' ')[0]}
                            </span>
                            <h4 className="text-xs font-bold text-white mt-0.5 truncate">
                                {m.name}
                            </h4>
                            <span className="text-[9px] text-white/50 mt-1">
                                {m.difficulty}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2 mb-5">
                    <span className="text-[11px] font-mono text-white/50 uppercase">
                        Washi Paper:
                    </span>
                    {patterns.map((p) => (
                        <button
                            key={p.id}
                            onClick={() => setSelectedPattern(p.id)}
                            className={`px-3 py-1 rounded-full border text-[10px] font-mono transition-all ${
                                selectedPattern === p.id
                                    ? `${p.color} text-white font-bold ring-1 ring-white/50`
                                    : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10'
                            }`}
                        >
                            {p.name.split(' ')[0]}
                        </button>
                    ))}
                </div>

                <div className="bg-black/60 rounded-2xl p-5 border border-white/10 mb-6 flex flex-col space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-wider">
                                Step {currentStep + 1} of {currentM.steps.length}
                            </span>
                            {isFinished && (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                                    Craft Complete
                                </span>
                            )}
                        </div>
                        <span className="text-xs font-mono text-white/40">
                            {Math.round(((currentStep + 1) / currentM.steps.length) * 100)}% Folded
                        </span>
                    </div>

                    <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-rose-500 to-amber-400 h-1.5 transition-all duration-300 rounded-full"
                            style={{ width: `${((currentStep + 1) / currentM.steps.length) * 100}%` }}
                        />
                    </div>

                    <p className="text-sm text-white/90 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
                        {currentM.steps[currentStep]}
                    </p>

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={prevStep}
                            disabled={currentStep === 0}
                            className={`w-1/3 py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all ${
                                currentStep === 0
                                    ? 'border-white/5 text-white/20 cursor-not-allowed'
                                    : 'border-white/20 bg-white/5 text-white hover:bg-white/15'
                            }`}
                        >
                            Previous Fold
                        </button>
                        <button
                            onClick={nextStep}
                            disabled={isFinished}
                            className={`w-2/3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                                isFinished
                                    ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 cursor-default'
                                    : 'bg-rose-500 text-white shadow-lg hover:bg-rose-400'
                            }`}
                        >
                            {isFinished ? 'Model Mastered' : 'Crease & Fold Next'}
                        </button>
                    </div>
                </div>

                <button
                    onClick={handleClose}
                    className="w-full py-3 rounded-xl bg-white/10 border border-white/15 text-white font-bold uppercase tracking-wider text-xs hover:bg-white/20 transition-all"
                >
                    Close Origami Studio
                </button>
            </div>
        </div>
    );
}
