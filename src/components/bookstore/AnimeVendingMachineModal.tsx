'use client';

import { useBookstoreStore } from '@/store/bookstoreStore';
import { useCallback, useEffect, useRef, useState } from 'react';

interface DrinkItem {
    id: string;
    name: string;
    nameJp: string;
    price: number;
    temp: 'COLD' | 'HOT';
    color: string;
    desc: string;
}

export default function AnimeVendingMachineModal() {
    const { isVendingOpen, setVendingOpen, isAudioPlaying } = useBookstoreStore();
    const [selectedDrink, setSelectedDrink] = useState<DrinkItem | null>(null);
    const [dispensedDrink, setDispensedDrink] = useState<string | null>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);

    const drinks: DrinkItem[] = [
        { id: 'boss', name: 'Boss Rainbow Mountain Coffee', nameJp: 'BOSS レインボーマウンテン', price: 140, temp: 'HOT', color: 'from-amber-600 to-amber-900 border-amber-400', desc: 'A rich and aromatic roasted blend of seven mountain coffee beans.' },
        { id: 'pocari', name: 'Pocari Sweat Ion Supply', nameJp: 'ポカリスエット', price: 160, temp: 'COLD', color: 'from-blue-500 to-cyan-700 border-blue-400', desc: 'Hydrating electrolyte ion water with a light citrus finish.' },
        { id: 'ramune', name: 'Classic Glass Marble Ramune', nameJp: 'ラムネ (ガラス玉)', price: 180, temp: 'COLD', color: 'from-teal-400 to-emerald-700 border-teal-300', desc: 'Crisp carbonated retro soda with iconic glass marble stopper.' },
        { id: 'greentea', name: 'Oi Ocha Cold Brew Green Tea', nameJp: 'お〜いお茶 濃い茶', price: 150, temp: 'COLD', color: 'from-green-600 to-emerald-900 border-green-400', desc: 'Authentic 100% Japanese sencha green tea brewed cold.' },
        { id: 'calpis', name: 'Calpis White Water Soda', nameJp: 'カルピスソーダ', price: 150, temp: 'COLD', color: 'from-sky-400 to-indigo-600 border-sky-300', desc: 'Refreshing lactic cultured sweet and tangy milk soda.' },
        { id: 'ucc', name: 'UCC Original Milk Coffee', nameJp: 'UCC ミルクコーヒー', price: 130, temp: 'HOT', color: 'from-yellow-700 to-amber-950 border-yellow-500', desc: 'Japan\'s classic 1969 nostalgic sweet canned milk coffee.' },
    ];

    const handleClose = useCallback(() => {
        setVendingOpen(false);
    }, [setVendingOpen]);

    const playDispenseAudio = () => {
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

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.25);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.32);
    };

    const handleBuy = (d: DrinkItem) => {
        setSelectedDrink(d);
        playDispenseAudio();
        setDispensedDrink(d.name);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isVendingOpen) {
                handleClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isVendingOpen, handleClose]);

    if (!isVendingOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6 backdrop-blur-2xl animate-in fade-in duration-200 select-none">
            <div className="relative flex flex-col w-full max-w-2xl rounded-3xl border border-blue-500/30 bg-gradient-to-b from-[#0e1628]/95 to-[#040812]/95 p-6 md:p-8 shadow-2xl backdrop-blur-2xl">
                <button
                    onClick={handleClose}
                    className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all"
                >
                    ✕
                </button>

                <div className="flex items-center gap-3 border-b border-blue-500/20 pb-4 mb-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/20 border border-blue-400/40 text-blue-300 font-bold font-mono">
                        VEND
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-white">
                            Tokyo Street Drink Vending Machine
                        </h2>
                        <p className="text-xs text-blue-400 font-medium">
                            Floor 1 Manga Archive • Chilled Cans & Hot Brews
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
                    {drinks.map((d) => (
                        <button
                            key={d.id}
                            onClick={() => handleBuy(d)}
                            className="flex flex-col p-3 rounded-2xl border border-white/10 bg-white/5 hover:border-blue-400 hover:bg-blue-500/15 transition-all text-left group"
                        >
                            <div className="flex items-center justify-between mb-1.5">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                                    d.temp === 'COLD' ? 'bg-blue-500/30 text-blue-300 border border-blue-400/40' : 'bg-red-500/30 text-red-300 border border-red-400/40'
                                }`}>
                                    {d.temp}
                                </span>
                                <span className="font-mono text-xs font-bold text-amber-300">
                                    ¥{d.price}
                                </span>
                            </div>
                            <span className="text-[10px] text-white/50 block truncate">
                                {d.nameJp}
                            </span>
                            <h4 className="text-xs font-bold text-white mt-0.5 truncate group-hover:text-blue-300">
                                {d.name}
                            </h4>
                        </button>
                    ))}
                </div>

                {dispensedDrink && (
                    <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 mb-5 flex items-center justify-between animate-in fade-in">
                        <div>
                            <span className="text-[10px] font-mono font-bold text-emerald-300 uppercase block">
                                Dispensed from Slot
                            </span>
                            <h3 className="text-sm font-bold text-white">
                                {dispensedDrink}
                            </h3>
                        </div>
                        <span className="text-xs font-mono font-bold text-emerald-300 bg-black/40 px-3 py-1 rounded-full">
                            Ice Cold & Ready
                        </span>
                    </div>
                )}

                <button
                    onClick={handleClose}
                    className="w-full py-3 rounded-xl bg-white/10 border border-white/15 text-white font-bold uppercase tracking-wider text-xs hover:bg-white/20 transition-all"
                >
                    Close Vending Machine
                </button>
            </div>
        </div>
    );
}
