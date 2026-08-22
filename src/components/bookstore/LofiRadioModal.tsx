'use client';

import { useBookstoreStore } from '@/store/bookstoreStore';
import { useCallback, useEffect, useRef, useState } from 'react';

interface RadioStation {
    id: string;
    freq: string;
    name: string;
    nameJp: string;
    genre: string;
    baseFreq: number;
}

export default function LofiRadioModal() {
    const { isRadioOpen, setRadioOpen, activeRadioStation, setActiveRadioStation, isAudioPlaying, toggleAudio } = useBookstoreStore();
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [volume, setVolume] = useState<number>(80);

    const handleClose = useCallback(() => {
        setRadioOpen(false);
    }, [setRadioOpen]);

    const stations: RadioStation[] = [
        { id: 'tokyo-chill', freq: '88.5 FM', name: 'Tokyo Chill Hop', nameJp: '東京チルホップ', genre: 'Lo-Fi Beats', baseFreq: 220 },
        { id: 'shibuya-cyber', freq: '94.2 FM', name: 'Shibuya Cyber Midnight', nameJp: '渋谷電脳夜', genre: 'Synthwave', baseFreq: 260 },
        { id: 'ghibli-piano', freq: '101.1 FM', name: 'Starlit Nostalgia Piano', nameJp: '星空ピアノ', genre: 'Ambient Classical', baseFreq: 310 },
        { id: 'akiba-night', freq: '106.8 FM', name: 'Akihabara Nightcore', nameJp: '秋葉原深夜便', genre: 'Future Bass', baseFreq: 370 },
    ];

    const currentStation = stations[activeRadioStation] || stations[0];

    useEffect(() => {
        if (!isRadioOpen || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animId: number;
        let phase = 0;

        const renderVisualizer = () => {
            ctx.fillStyle = '#05070d';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const numBars = 32;
            const barWidth = canvas.width / numBars;

            for (let i = 0; i < numBars; i++) {
                const heightMult = isAudioPlaying ? Math.abs(Math.sin(phase + i * 0.35)) * 45 + 5 : 4;
                const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
                gradient.addColorStop(0, '#06b6d4');
                gradient.addColorStop(1, '#ec4899');

                ctx.fillStyle = gradient;
                ctx.fillRect(i * barWidth + 2, canvas.height - heightMult, barWidth - 4, heightMult);
            }

            phase += 0.08;
            animId = requestAnimationFrame(renderVisualizer);
        };

        renderVisualizer();

        return () => cancelAnimationFrame(animId);
    }, [isRadioOpen, isAudioPlaying, activeRadioStation]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isRadioOpen) {
                handleClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isRadioOpen, handleClose]);

    if (!isRadioOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6 backdrop-blur-2xl animate-in fade-in duration-200 select-none">
            <div className="relative flex flex-col w-full max-w-xl rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-[#0e1626]/95 to-[#060810]/95 p-6 md:p-8 shadow-2xl backdrop-blur-2xl">
                <button
                    onClick={handleClose}
                    className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all"
                >
                    ✕
                </button>

                <div className="flex items-center gap-3 border-b border-cyan-500/20 pb-4 mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-bold font-mono">
                        FM
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-white">
                            Nanimo Lo-Fi Radio Tuner
                        </h2>
                        <p className="text-xs text-cyan-400 font-medium">
                            Tokyo Spatial Broadcast • Live Frequency Stream
                        </p>
                    </div>
                </div>

                <div className="bg-black/60 rounded-2xl p-4 border border-white/10 mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <span className="text-[10px] font-mono font-bold text-pink-400 uppercase tracking-widest">
                                {currentStation.freq} • {currentStation.genre}
                            </span>
                            <h3 className="text-base font-bold text-white">
                                {currentStation.name}
                            </h3>
                        </div>
                        <button
                            onClick={toggleAudio}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold font-mono uppercase tracking-wider transition-all ${
                                isAudioPlaying
                                    ? 'bg-cyan-400 text-black shadow-lg shadow-cyan-400/20'
                                    : 'border border-white/20 text-white/60 hover:text-white'
                            }`}
                        >
                            {isAudioPlaying ? 'Broadcasting' : 'Muted'}
                        </button>
                    </div>

                    <canvas
                        ref={canvasRef}
                        width={460}
                        height={70}
                        className="w-full rounded-xl bg-[#05070d] border border-white/5 shadow-inner"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6">
                    {stations.map((st, idx) => (
                        <button
                            key={st.id}
                            onClick={() => setActiveRadioStation(idx)}
                            className={`flex flex-col p-3 rounded-2xl border transition-all text-left ${
                                activeRadioStation === idx
                                    ? 'border-cyan-400 bg-cyan-500/20 shadow-md'
                                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-mono font-bold text-cyan-300">
                                    {st.freq}
                                </span>
                                <span className="text-[10px] text-white/40">{st.genre}</span>
                            </div>
                            <h4 className="text-xs font-bold text-white mt-1">{st.name}</h4>
                        </button>
                    ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs text-white/50">
                    <span>Volume</span>
                    <input
                        type="range"
                        min={0}
                        max={100}
                        value={volume}
                        onChange={(e) => setVolume(parseInt(e.target.value, 10))}
                        className="w-44 accent-cyan-400 cursor-pointer"
                    />
                    <span className="font-mono text-white/80">{volume}%</span>
                </div>
            </div>
        </div>
    );
}
