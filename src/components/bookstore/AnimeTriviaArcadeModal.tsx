'use client';

import { useBookstoreStore } from '@/store/bookstoreStore';
import { useCallback, useEffect, useRef, useState } from 'react';

interface TriviaQuestion {
    q: string;
    options: string[];
    answer: number;
    trivia: string;
}

export default function AnimeTriviaArcadeModal() {
    const { isTriviaArcadeOpen, setTriviaArcadeOpen, isAudioPlaying } = useBookstoreStore();
    const [currentIdx, setCurrentIdx] = useState<number>(0);
    const [score, setScore] = useState<number>(0);
    const [combo, setCombo] = useState<number>(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState<boolean>(false);
    const [isFinished, setIsFinished] = useState<boolean>(false);
    const audioCtxRef = useRef<AudioContext | null>(null);

    const questions: TriviaQuestion[] = [
        {
            q: 'In "Neon Genesis Evangelion", what is the name of Shinji\'s unit?',
            options: ['Unit-00', 'Unit-01', 'Unit-02', 'Unit-03'],
            answer: 1,
            trivia: 'Unit-01 is the Test Type Evangelion piloted by Shinji Ikari.',
        },
        {
            q: 'Which anime studio produced "Spirited Away" and "Princess Mononoke"?',
            options: ['MAPPA', 'Studio Ghibli', 'Bones', 'CoMix Wave'],
            answer: 1,
            trivia: 'Studio Ghibli was co-founded by Hayao Miyazaki and Isao Takahata.',
        },
        {
            q: 'What is the highest-ranked Demon Slayer rank below Hashira?',
            options: ['Mizunoto', 'Kanoe', 'Kinoe', 'Tsuchinoto'],
            answer: 2,
            trivia: 'Kinoe is the 10th and highest rank a corps member can attain before Pillar status.',
        },
        {
            q: 'What is the name of the notebook\'s original owner in "Death Note"?',
            options: ['Rem', 'Ryuk', 'Sidoh', 'Gelus'],
            answer: 1,
            trivia: 'Ryuk dropped his notebook into the human world out of sheer boredom.',
        },
        {
            q: 'In "Fullmetal Alchemist", what is the core rule of Alchemy?',
            options: ['Philosopher Power', 'Equivalent Exchange', 'Soul Transmutation', 'Circle Binding'],
            answer: 1,
            trivia: 'To obtain something, something of equal value must be lost or presented.',
        },
    ];

    const handleClose = useCallback(() => {
        setTriviaArcadeOpen(false);
        setCurrentIdx(0);
        setScore(0);
        setCombo(0);
        setSelectedOption(null);
        setIsAnswered(false);
        setIsFinished(false);
    }, [setTriviaArcadeOpen]);

    const playBeep = (isCorrect: boolean) => {
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

        if (isCorrect) {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(523.25, now);
            osc.frequency.setValueAtTime(659.25, now + 0.1);
            gain.gain.setValueAtTime(0.06, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.28);
        } else {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(140, now);
            osc.frequency.setValueAtTime(100, now + 0.12);
            gain.gain.setValueAtTime(0.06, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.32);
        }
    };

    const handleAnswer = (optionIdx: number) => {
        if (isAnswered) return;
        setSelectedOption(optionIdx);
        setIsAnswered(true);

        const current = questions[currentIdx];
        const isCorrect = optionIdx === current.answer;
        playBeep(isCorrect);

        if (isCorrect) {
            const addedScore = 100 + combo * 25;
            setScore((prev) => prev + addedScore);
            setCombo((prev) => prev + 1);
        } else {
            setCombo(0);
        }
    };

    const handleNext = () => {
        if (currentIdx + 1 < questions.length) {
            setCurrentIdx((prev) => prev + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            setIsFinished(true);
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isTriviaArcadeOpen) {
                handleClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isTriviaArcadeOpen, handleClose]);

    if (!isTriviaArcadeOpen) return null;

    const currentQ = questions[currentIdx];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6 backdrop-blur-2xl animate-in fade-in duration-200 select-none">
            <div className="relative flex flex-col w-full max-w-xl rounded-3xl border border-pink-500/30 bg-gradient-to-b from-[#220d1c]/95 to-[#0a0408]/95 p-6 md:p-8 shadow-2xl backdrop-blur-2xl">
                <button
                    onClick={handleClose}
                    className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all"
                >
                    ✕
                </button>

                <div className="flex items-center justify-between border-b border-pink-500/20 pb-4 mb-6">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="rounded-full bg-pink-500/20 border border-pink-400/40 px-3 py-0.5 text-xs font-bold text-pink-300 uppercase tracking-widest">
                                Arcade Cabinet
                            </span>
                            <span className="text-xs font-mono text-white/50">
                                Question {currentIdx + 1} of {questions.length}
                            </span>
                        </div>
                        <h2 className="text-xl font-bold text-white tracking-tight mt-1">
                            Anime Trivia Arcade
                        </h2>
                    </div>

                    <div className="text-right mr-10">
                        <span className="text-2xl font-extrabold font-mono text-pink-400">
                            {score} PTS
                        </span>
                        {combo > 1 && (
                            <p className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest animate-pulse">
                                {combo}X Combo!
                            </p>
                        )}
                    </div>
                </div>

                {!isFinished ? (
                    <>
                        <div className="bg-black/60 border border-white/10 rounded-2xl p-5 mb-5 shadow-inner">
                            <p className="text-sm md:text-base font-bold text-white leading-relaxed">
                                {currentQ.q}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                            {currentQ.options.map((opt, idx) => {
                                let btnStyle = 'border-white/10 bg-white/5 hover:border-pink-400/60 hover:bg-white/10';
                                if (isAnswered) {
                                    if (idx === currentQ.answer) {
                                        btnStyle = 'border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-md';
                                    } else if (selectedOption === idx) {
                                        btnStyle = 'border-rose-500 bg-rose-500/20 text-rose-300';
                                    } else {
                                        btnStyle = 'border-white/5 bg-white/5 opacity-40';
                                    }
                                }

                                return (
                                    <button
                                        key={idx}
                                        disabled={isAnswered}
                                        onClick={() => handleAnswer(idx)}
                                        className={`flex items-center gap-3 p-4 rounded-2xl border text-xs font-bold text-left transition-all ${btnStyle}`}
                                    >
                                        <span className="h-6 w-6 rounded-lg bg-white/10 flex items-center justify-center font-mono text-[10px] text-white/70">
                                            {String.fromCharCode(65 + idx)}
                                        </span>
                                        <span className="text-white truncate">{opt}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {isAnswered && (
                            <div className="flex flex-col gap-3 animate-in fade-in">
                                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white/70 leading-relaxed font-mono">
                                    {currentQ.trivia}
                                </div>
                                <button
                                    onClick={handleNext}
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold uppercase tracking-wider text-xs shadow-lg hover:from-pink-400 hover:to-rose-400 transition-all"
                                >
                                    {currentIdx + 1 < questions.length ? 'Next Question' : 'View Results'}
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center py-6">
                        <div className="h-20 w-20 rounded-3xl bg-gradient-to-tr from-pink-500 to-amber-400 flex items-center justify-center font-mono font-black text-2xl text-black shadow-2xl mb-4">
                            S+
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-1">
                            Arcade Match Complete!
                        </h3>
                        <p className="text-xs text-white/50 uppercase tracking-widest mb-6">
                            Final Score: {score} Points
                        </p>

                        <button
                            onClick={handleClose}
                            className="w-full py-3 rounded-xl bg-pink-500 text-white font-bold uppercase tracking-wider text-xs shadow-lg hover:bg-pink-400 transition-all"
                        >
                            Return to Lounge
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
