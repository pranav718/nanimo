'use client';

import { useBookstoreStore } from '@/store/bookstoreStore';
import { useCallback, useEffect, useRef, useState } from 'react';

interface FireworkPreset {
    id: string;
    name: string;
    nameJp: string;
    color: string;
    desc: string;
}

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    alpha: number;
    color: string;
    size: number;
    decay: number;
}

export default function TokyoFireworksModal() {
    const { isFireworksOpen, setFireworksOpen, isAudioPlaying } = useBookstoreStore();
    const [selectedPreset, setSelectedPreset] = useState<string>('chrysanthemum');
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const particlesRef = useRef<Particle[]>([]);

    const presets: FireworkPreset[] = [
        { id: 'chrysanthemum', name: 'Imperial Chrysanthemum', nameJp: '黄金菊 (Golden Spark)', color: '#f59e0b', desc: 'Spherical golden burst with long lingering trails.' },
        { id: 'peony', name: 'Tokyo Neon Peony', nameJp: '牡丹 (Violet & Cyan)', color: '#a855f7', desc: 'Vibrant multi-colored stars without trails.' },
        { id: 'sakura', name: 'Spring Sakura Cascade', nameJp: '桜吹雪 (Petal Bloom)', color: '#f472b6', desc: 'Delicate pink blossom explosions drifting softly.' },
        { id: 'willow', name: 'Starlit Willow Crown', nameJp: '銀柳 (Kamuro Willow)', color: '#38bdf8', desc: 'Cascading streamers falling slowly down the sky.' },
    ];

    const handleClose = useCallback(() => {
        setFireworksOpen(false);
    }, [setFireworksOpen]);

    const playBoomAudio = () => {
        if (!isAudioPlaying) return;
        if (!audioCtxRef.current) {
            const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            audioCtxRef.current = new AudioCtx();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') ctx.resume();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        const now = ctx.currentTime;

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.4);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, now);
        filter.frequency.exponentialRampToValueAtTime(80, now + 0.5);

        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.6);
    };

    const triggerLaunch = (presetId?: string) => {
        const id = presetId || selectedPreset;
        const current = presets.find((p) => p.id === id) || presets[0];
        playBoomAudio();

        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const originX = canvas.width / 2 + (Math.random() * 120 - 60);
        const originY = canvas.height * 0.35 + (Math.random() * 60 - 30);

        const count = 55;
        const newParticles: Particle[] = [];
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const speed = Math.random() * 4.5 + 2.5;
            newParticles.push({
                x: originX,
                y: originY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                alpha: 1.0,
                color: current.color,
                size: Math.random() * 2.5 + 1.5,
                decay: Math.random() * 0.015 + 0.012,
            });
        }
        particlesRef.current.push(...newParticles);
    };

    useEffect(() => {
        if (!isFireworksOpen || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animId: number;

        const loop = () => {
            ctx.fillStyle = 'rgba(5, 7, 15, 0.25)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const active: Particle[] = [];
            for (const p of particlesRef.current) {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.04;
                p.alpha -= p.decay;

                if (p.alpha > 0) {
                    ctx.save();
                    ctx.globalAlpha = p.alpha;
                    ctx.fillStyle = p.color;
                    ctx.shadowColor = p.color;
                    ctx.shadowBlur = 8;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                    active.push(p);
                }
            }
            particlesRef.current = active;
            animId = requestAnimationFrame(loop);
        };

        loop();
        triggerLaunch();

        return () => cancelAnimationFrame(animId);
    }, [isFireworksOpen]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isFireworksOpen) {
                handleClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isFireworksOpen, handleClose]);

    if (!isFireworksOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6 backdrop-blur-2xl animate-in fade-in duration-200 select-none">
            <div className="relative flex flex-col w-full max-w-2xl rounded-3xl border border-amber-500/30 bg-gradient-to-b from-[#24170a]/95 to-[#0b0703]/95 p-6 md:p-8 shadow-2xl backdrop-blur-2xl">
                <button
                    onClick={handleClose}
                    className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all"
                >
                    ✕
                </button>

                <div className="flex items-center gap-3 border-b border-amber-500/20 pb-4 mb-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 font-bold font-mono">
                        HANABI
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-white">
                            Tokyo Rooftop Fireworks Launcher
                        </h2>
                        <p className="text-xs text-amber-400 font-medium">
                            Floor 3 Observatory • Japanese Festival Sky Fireworks
                        </p>
                    </div>
                </div>

                <div className="relative w-full bg-black/60 rounded-2xl p-2 border border-white/10 mb-5 shadow-inner">
                    <canvas
                        ref={canvasRef}
                        width={520}
                        height={260}
                        className="w-full rounded-xl bg-[#05070f]"
                    />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
                    {presets.map((p) => (
                        <button
                            key={p.id}
                            onClick={() => {
                                setSelectedPreset(p.id);
                                triggerLaunch(p.id);
                            }}
                            className={`flex flex-col p-3 rounded-2xl border text-left transition-all ${
                                selectedPreset === p.id
                                    ? 'border-amber-400 bg-amber-500/20 shadow-md ring-1 ring-amber-400'
                                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                            }`}
                        >
                            <span className="text-[10px] font-mono font-bold text-amber-300">
                                {p.nameJp}
                            </span>
                            <h4 className="text-xs font-bold text-white mt-0.5 truncate">
                                {p.name}
                            </h4>
                        </button>
                    ))}
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => triggerLaunch()}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold uppercase tracking-wider text-xs shadow-lg hover:from-amber-400 hover:to-yellow-400 transition-all"
                    >
                        Launch Firework Rockets
                    </button>
                </div>
            </div>
        </div>
    );
}
