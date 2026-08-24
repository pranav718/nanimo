'use client';

import { useBookstoreStore } from '@/store/bookstoreStore';
import { useCallback, useEffect, useRef, useState } from 'react';

interface Constellation {
    id: string;
    studio: string;
    studioJp: string;
    starsName: string;
    notableWorks: string;
    description: string;
    points: [number, number][];
    color: string;
}

export default function CosmicTelescopeModal() {
    const { isTelescopeOpen, setTelescopeOpen } = useBookstoreStore();
    const [selectedConstellation, setSelectedConstellation] = useState<number>(0);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const handleClose = useCallback(() => {
        setTelescopeOpen(false);
    }, [setTelescopeOpen]);

    const constellations: Constellation[] = [
        {
            id: 'kyoto',
            studio: 'Kyoto Animation',
            studioJp: '京都アニメーション',
            starsName: 'The Luminary Lantern (燈火座)',
            notableWorks: 'Violet Evergarden, Clannad, A Silent Voice',
            description: 'A delicate constellation representing emotional warmth, meticulous artistry, and tender human connections.',
            points: [[120, 80], [180, 140], [240, 90], [300, 160], [210, 220], [120, 80]],
            color: '#f472b6',
        },
        {
            id: 'ghibli',
            studio: 'Studio Ghibli',
            studioJp: 'スタジオジブリ',
            starsName: 'The Ancient Forest Spirit (巨樹座)',
            notableWorks: 'Spirited Away, Princess Mononoke, Howl\'s Moving Castle',
            description: 'The ancient starlight of childhood wonder, soaring wind drafts, and harmony with the natural world.',
            points: [[200, 60], [140, 120], [160, 200], [240, 200], [260, 120], [200, 60]],
            color: '#34d399',
        },
        {
            id: 'ufotable',
            studio: 'Ufotable',
            studioJp: 'ユーフォーテーブル',
            starsName: 'The Crimson Blade Sun (日輪座)',
            notableWorks: 'Demon Slayer, Fate/stay night: Heaven\'s Feel',
            description: 'A radiant constellation of kinetic illumination, fluid sword dance choreography, and blazing digital mastery.',
            points: [[150, 150], [200, 90], [250, 150], [200, 210], [150, 150]],
            color: '#f59e0b',
        },
        {
            id: 'mappa',
            studio: 'MAPPA',
            studioJp: 'マッパ',
            starsName: 'The Chaos Comet (裂空座)',
            notableWorks: 'Jujutsu Kaisen, Attack on Titan Final, Chainsaw Man',
            description: 'High-octane kinetic energy, raw grit, and groundbreaking modern anime sakuga animation.',
            points: [[100, 200], [180, 150], [260, 110], [340, 70]],
            color: '#38bdf8',
        },
        {
            id: 'bones',
            studio: 'Studio Bones',
            studioJp: 'ボンズ',
            starsName: 'The Hero\'s Crest (剛勇座)',
            notableWorks: 'Fullmetal Alchemist: Brotherhood, Mob Psycho 100, My Hero Academia',
            description: 'A constellation that burns with relentless heroic willpower, explosive kinetic impacts, and pure dynamism.',
            points: [[130, 100], [200, 70], [270, 100], [250, 180], [200, 230], [150, 180], [130, 100]],
            color: '#a855f7',
        },
    ];

    const current = constellations[selectedConstellation] || constellations[0];

    useEffect(() => {
        if (!isTelescopeOpen || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animId: number;
        let starPhase = 0;

        const stars: { x: number; y: number; size: number; alpha: number }[] = [];
        for (let i = 0; i < 90; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 1.8 + 0.5,
                alpha: Math.random() * 0.8 + 0.2,
            });
        }

        const renderSky = () => {
            ctx.fillStyle = '#050713';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            stars.forEach((s) => {
                ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha * (0.6 + Math.sin(starPhase + s.x) * 0.4)})`;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
                ctx.fill();
            });

            ctx.strokeStyle = current.color;
            ctx.lineWidth = 2.5;
            ctx.shadowColor = current.color;
            ctx.shadowBlur = 12;

            ctx.beginPath();
            current.points.forEach((p, idx) => {
                const scaleX = canvas.width / 440;
                const scaleY = canvas.height / 300;
                const x = p[0] * scaleX;
                const y = p[1] * scaleY;
                if (idx === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.stroke();

            current.points.forEach((p) => {
                const scaleX = canvas.width / 440;
                const scaleY = canvas.height / 300;
                const x = p[0] * scaleX;
                const y = p[1] * scaleY;

                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(x, y, 4.5, 0, Math.PI * 2);
                ctx.fill();
            });

            ctx.shadowBlur = 0;
            starPhase += 0.04;
            animId = requestAnimationFrame(renderSky);
        };

        renderSky();

        return () => cancelAnimationFrame(animId);
    }, [isTelescopeOpen, selectedConstellation, current]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isTelescopeOpen) {
                handleClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isTelescopeOpen, handleClose]);

    if (!isTelescopeOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6 backdrop-blur-2xl animate-in fade-in duration-200 select-none">
            <div className="relative flex flex-col w-full max-w-2xl rounded-3xl border border-indigo-500/30 bg-gradient-to-b from-[#0e122b]/95 to-[#050711]/95 p-6 md:p-8 shadow-2xl backdrop-blur-2xl">
                <button
                    onClick={handleClose}
                    className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all"
                >
                    ✕
                </button>

                <div className="flex items-center justify-between border-b border-indigo-500/20 pb-4 mb-5">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="rounded-full bg-indigo-500/20 border border-indigo-400/40 px-3 py-0.5 text-xs font-bold text-indigo-300 uppercase tracking-widest">
                                3F Telescope
                            </span>
                            <span className="text-xs font-mono text-white/50">
                                Celestial Studio Constellations
                            </span>
                        </div>
                        <h2 className="text-xl font-bold text-white tracking-tight mt-1">
                            Tokyo Stargazer Chart
                        </h2>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-5 items-center mb-5">
                    <div className="w-full md:w-3/5 bg-black/60 rounded-2xl p-2 border border-white/10 shadow-inner">
                        <canvas
                            ref={canvasRef}
                            width={440}
                            height={280}
                            className="w-full rounded-xl bg-[#050713]"
                        />
                    </div>

                    <div className="w-full md:w-2/5 flex flex-col justify-between h-full space-y-3">
                        <div>
                            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-300">
                                {current.studioJp}
                            </span>
                            <h3 className="text-lg font-bold text-white mt-0.5">
                                {current.starsName}
                            </h3>
                            <p className="text-xs text-white/40 mt-0.5 font-medium">
                                {current.studio}
                            </p>
                        </div>

                        <p className="text-xs text-white/70 leading-relaxed">
                            {current.description}
                        </p>

                        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                            <span className="text-[10px] uppercase font-mono text-white/40 block mb-0.5">
                                Iconic Works
                            </span>
                            <span className="text-xs text-white/90 font-medium">
                                {current.notableWorks}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1">
                    {constellations.map((c, idx) => (
                        <button
                            key={c.id}
                            onClick={() => setSelectedConstellation(idx)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                                selectedConstellation === idx
                                    ? 'bg-indigo-500/20 border-indigo-400 text-white shadow-md'
                                    : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            {c.studio}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
