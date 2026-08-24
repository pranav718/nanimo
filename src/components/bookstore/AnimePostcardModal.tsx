'use client';

import { useBookstoreStore } from '@/store/bookstoreStore';
import { useCallback, useEffect, useRef, useState } from 'react';

export default function AnimePostcardModal() {
    const { isPostcardOpen, setPostcardOpen } = useBookstoreStore();
    const [recipient, setRecipient] = useState<string>('Fellow Manga Traveler');
    const [message, setMessage] = useState<string>('Greetings from Nanimo 3D Bookstore! The archive is endless.');
    const [selectedStamp, setSelectedStamp] = useState<string>('fuji');
    const [selectedSeal, setSelectedSeal] = useState<string>('gold');
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const handleClose = useCallback(() => {
        setPostcardOpen(false);
    }, [setPostcardOpen]);

    const stamps = [
        { id: 'fuji', name: 'Mt. Fuji Sakura', color: '#f472b6', label: '80 YEN' },
        { id: 'akiba', name: 'Akiba Cyber Neon', color: '#38bdf8', label: '120 YEN' },
        { id: 'kyoto', name: 'Kyoto Torii Shrine', color: '#ef4444', label: '100 YEN' },
    ];

    const seals = [
        { id: 'gold', name: 'Nanimo Imperial Gold', color: '#f59e0b' },
        { id: 'ink', name: 'Manga Black Ink', color: '#18181b' },
        { id: 'vermilion', name: 'Shinto Vermilion', color: '#dc2626' },
    ];

    useEffect(() => {
        if (!isPostcardOpen || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.fillStyle = '#faf8f5';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = '#d4d4d8';
        ctx.lineWidth = 2;
        ctx.strokeRect(12, 12, canvas.width - 24, canvas.height - 24);

        ctx.strokeStyle = '#e4e4e7';
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, 24);
        ctx.lineTo(canvas.width / 2, canvas.height - 24);
        ctx.stroke();

        const stampObj = stamps.find((s) => s.id === selectedStamp) || stamps[0];
        ctx.fillStyle = stampObj.color;
        ctx.fillRect(canvas.width - 100, 24, 76, 90);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.strokeRect(canvas.width - 96, 28, 68, 82);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(stampObj.label, canvas.width - 62, 50);
        ctx.font = '10px sans-serif';
        ctx.fillText('JAPAN', canvas.width - 62, 95);

        const sealObj = seals.find((s) => s.id === selectedSeal) || seals[0];
        ctx.fillStyle = sealObj.color;
        ctx.beginPath();
        ctx.arc(canvas.width - 62, canvas.height - 70, 24, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px serif';
        ctx.fillText('何', canvas.width - 62, canvas.height - 65);

        ctx.fillStyle = '#27272a';
        ctx.font = 'bold 16px serif';
        ctx.textAlign = 'left';
        ctx.fillText(`To: ${recipient}`, 36, 60);

        ctx.font = '13px sans-serif';
        ctx.fillStyle = '#52525b';
        const words = message.split(' ');
        let line = '';
        let y = 95;
        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > 220 && n > 0) {
                ctx.fillText(line, 36, y);
                line = words[n] + ' ';
                y += 24;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, 36, y);

        ctx.fillStyle = '#a1a1aa';
        ctx.font = '10px monospace';
        ctx.fillText('POSTED FROM NANIMO 3D TOKYO ARCHIVE', 36, canvas.height - 35);
    }, [isPostcardOpen, recipient, message, selectedStamp, selectedSeal]);

    const handleDownload = () => {
        if (!canvasRef.current) return;
        const link = document.createElement('a');
        link.download = `nanimo_postcard_${Date.now()}.png`;
        link.href = canvasRef.current.toDataURL('image/png');
        link.click();
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isPostcardOpen) {
                handleClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPostcardOpen, handleClose]);

    if (!isPostcardOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6 backdrop-blur-2xl animate-in fade-in duration-200 select-none">
            <div className="relative flex flex-col w-full max-w-2xl rounded-3xl border border-rose-500/30 bg-gradient-to-b from-[#241018]/95 to-[#0b0407]/95 p-6 md:p-8 shadow-2xl backdrop-blur-2xl">
                <button
                    onClick={handleClose}
                    className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all"
                >
                    ✕
                </button>

                <div className="flex items-center gap-3 border-b border-rose-500/20 pb-4 mb-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/20 border border-rose-400/40 text-rose-300 font-bold font-mono">
                        POST
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-white">
                            Tokyo Postcard Studio
                        </h2>
                        <p className="text-xs text-rose-400 font-medium">
                            Floor 1 Stationery • Custom Vintage Anime Mail
                        </p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-5 items-center mb-5">
                    <div className="w-full md:w-1/2 flex items-center justify-center bg-black/60 rounded-2xl p-2 border border-white/10 shadow-inner">
                        <canvas
                            ref={canvasRef}
                            width={540}
                            height={340}
                            className="w-full rounded-xl shadow-lg"
                        />
                    </div>

                    <div className="w-full md:w-1/2 flex flex-col space-y-3">
                        <div>
                            <label className="text-[10px] uppercase font-mono text-white/50 block mb-1">
                                Recipient
                            </label>
                            <input
                                type="text"
                                value={recipient}
                                onChange={(e) => setRecipient(e.target.value)}
                                className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white placeholder-white/30 focus:border-rose-400 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] uppercase font-mono text-white/50 block mb-1">
                                Message
                            </label>
                            <textarea
                                rows={2}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white placeholder-white/30 focus:border-rose-400 focus:outline-none resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-[10px] uppercase font-mono text-white/50 block mb-1">
                                    Stamp
                                </label>
                                <div className="flex gap-1.5">
                                    {stamps.map((s) => (
                                        <button
                                            key={s.id}
                                            onClick={() => setSelectedStamp(s.id)}
                                            style={{ backgroundColor: s.color }}
                                            className={`h-7 flex-1 rounded-lg border text-[10px] font-bold text-white transition-all ${
                                                selectedStamp === s.id ? 'ring-2 ring-white scale-105' : 'opacity-60'
                                            }`}
                                        >
                                            {s.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] uppercase font-mono text-white/50 block mb-1">
                                    Seal
                                </label>
                                <div className="flex gap-1.5">
                                    {seals.map((s) => (
                                        <button
                                            key={s.id}
                                            onClick={() => setSelectedSeal(s.id)}
                                            style={{ backgroundColor: s.color }}
                                            className={`h-7 flex-1 rounded-lg border text-[10px] font-bold text-white transition-all ${
                                                selectedSeal === s.id ? 'ring-2 ring-white scale-105' : 'opacity-60'
                                            }`}
                                        >
                                            何
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleDownload}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold uppercase tracking-wider text-xs shadow-lg hover:from-rose-400 hover:to-pink-400 transition-all"
                    >
                        Export Postcard Image (PNG)
                    </button>
                </div>
            </div>
        </div>
    );
}
