'use client';

import { useBookstoreStore } from '@/store/bookstoreStore';
import { useCallback, useEffect, useRef, useState } from 'react';

interface TeaDrink {
    id: string;
    name: string;
    nameJp: string;
    desc: string;
    buff: string;
    color: string;
}

export default function MatchaTeaCartModal() {
    const { isTeaCartOpen, setTeaCartOpen, isAudioPlaying } = useBookstoreStore();
    const [selectedDrink, setSelectedDrink] = useState<string | null>(null);
    const [isBrewing, setIsBrewing] = useState<boolean>(false);
    const audioCtxRef = useRef<AudioContext | null>(null);

    const drinks: TeaDrink[] = [
        {
            id: 'matcha',
            name: 'Ceremonial Uji Matcha',
            nameJp: '宇治抹茶 (Pure Whisked)',
            desc: 'Stone-ground green tea leaves from Kyoto, whisked to a velvety emerald foam.',
            buff: '+25% Deep Reading Focus',
            color: 'from-emerald-600 to-green-700 border-emerald-400/50',
        },
        {
            id: 'sakura',
            name: 'Sakura Blossom Milk Tea',
            nameJp: '桜ミルクティー (Floral Infusion)',
            desc: 'Gentle floral black tea brewed with preserved spring sakura petals and creamy oat milk.',
            buff: '+20% Cozy Immersion',
            color: 'from-pink-500 to-rose-600 border-pink-400/50',
        },
        {
            id: 'hojicha',
            name: 'Roasted Hojicha Latte',
            nameJp: '焙じ茶ラテ (Charcoal Roasted)',
            desc: 'Charcoal roasted green tea offering a warm, nutty aroma and naturally low caffeine.',
            buff: 'Serene Mental Solace',
            color: 'from-amber-700 to-yellow-800 border-amber-600/50',
        },
        {
            id: 'boba',
            name: 'Brown Sugar Boba Elixir',
            nameJp: '黒糖タピオカ (Caramelized Pearls)',
            desc: 'Slow-cooked golden tapioca pearls swimming in Okinawa brown sugar syrup.',
            buff: 'Pure Joy & Sweet Energy',
            color: 'from-orange-600 to-amber-800 border-orange-400/50',
        },
    ];

    const handleClose = useCallback(() => {
        setTeaCartOpen(false);
        setIsBrewing(false);
    }, [setTeaCartOpen]);

    const playPourAudio = () => {
        if (!isAudioPlaying) return;
        if (!audioCtxRef.current) {
            const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            audioCtxRef.current = new AudioCtx();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') ctx.resume();

        const bufSize = ctx.sampleRate * 0.6;
        const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;

        const noise = ctx.createBufferSource();
        noise.buffer = buf;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, ctx.currentTime);
        filter.frequency.linearRampToValueAtTime(1400, ctx.currentTime + 0.4);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.55);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start();
    };

    const handleOrder = (drink: TeaDrink) => {
        setSelectedDrink(drink.id);
        setIsBrewing(true);
        playPourAudio();

        setTimeout(() => {
            setIsBrewing(false);
        }, 800);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isTeaCartOpen) {
                handleClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isTeaCartOpen, handleClose]);

    if (!isTeaCartOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6 backdrop-blur-2xl animate-in fade-in duration-200 select-none">
            <div className="relative flex flex-col w-full max-w-xl rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-[#112418]/95 to-[#050e09]/95 p-6 md:p-8 shadow-2xl backdrop-blur-2xl">
                <button
                    onClick={handleClose}
                    className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all"
                >
                    ✕
                </button>

                <div className="flex items-center gap-3 border-b border-emerald-500/20 pb-4 mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-bold font-mono">
                        TEA
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-white">
                            Matcha & Boba Tea Cart
                        </h2>
                        <p className="text-xs text-emerald-400 font-medium">
                            Traditional Japanese Tea Master Craft • Floor 1 Manga
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    {drinks.map((d) => {
                        const isChosen = selectedDrink === d.id;
                        return (
                            <button
                                key={d.id}
                                disabled={isBrewing}
                                onClick={() => handleOrder(d)}
                                className={`flex flex-col p-4 rounded-2xl border transition-all text-left ${
                                    isChosen
                                        ? `bg-white/10 ${d.color} ring-2 ring-emerald-400 shadow-xl`
                                        : 'border-white/10 bg-white/5 hover:border-emerald-400/40 hover:bg-white/10'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="text-sm font-bold text-white">
                                        {d.name}
                                    </h4>
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-emerald-300">
                                        {d.buff}
                                    </span>
                                </div>
                                <span className="text-[10px] text-white/50 mb-2">{d.nameJp}</span>
                                <p className="text-xs text-white/70 leading-relaxed">{d.desc}</p>
                            </button>
                        );
                    })}
                </div>

                {isBrewing && (
                    <div className="flex items-center justify-center py-3 bg-emerald-500/20 border border-emerald-400/30 rounded-xl mb-4 text-xs font-mono text-emerald-300 animate-pulse">
                        Whisking Fresh Leaves & Pouring...
                    </div>
                )}

                <button
                    onClick={handleClose}
                    className="w-full py-3 rounded-xl bg-emerald-400 text-black font-bold uppercase tracking-wider text-xs shadow-lg hover:bg-emerald-300 transition-all"
                >
                    Enjoy Drink & Read
                </button>
            </div>
        </div>
    );
}
