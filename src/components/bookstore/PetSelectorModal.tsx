'use client';

import { PetCompanionType } from './AvatarPetCompanion3D';
import { useBookstoreStore } from '@/store/bookstoreStore';
import { useCallback, useEffect } from 'react';

export default function PetSelectorModal() {
    const { isPetSelectorOpen, setPetSelectorOpen, activePet, setActivePet } = useBookstoreStore();

    const handleClose = useCallback(() => {
        setPetSelectorOpen(false);
    }, [setPetSelectorOpen]);

    const pets: {
        id: PetCompanionType;
        name: string;
        nameJp: string;
        element: string;
        desc: string;
        color: string;
    }[] = [
        {
            id: 'kitsune',
            name: 'Spirit Kitsune',
            nameJp: '霊狐 (Spiritual Fox)',
            element: 'Arcane Flame',
            desc: 'A celestial fox spirit that illuminates ancient manga scrolls with glowing stardust.',
            color: 'from-orange-500 to-amber-600 border-orange-400/50',
        },
        {
            id: 'cybercat',
            name: 'Cyber Neko Unit-01',
            nameJp: '電脳猫 (Holo Drone)',
            element: 'Cyber Pulse',
            desc: 'A high-frequency robotic companion scanning the store for top-rated sci-fi anime.',
            color: 'from-cyan-500 to-blue-600 border-cyan-400/50',
        },
        {
            id: 'shiba',
            name: 'Bookstore Shiba',
            nameJp: '書店柴犬 (Store Mascot)',
            element: 'Cozy Solace',
            desc: 'The official Nanimo mascot who happily naps beside warm coffee cups in the lounge.',
            color: 'from-amber-600 to-yellow-600 border-amber-400/50',
        },
        {
            id: 'none',
            name: 'Solo Explorer',
            nameJp: '単独探索',
            element: 'Neutral',
            desc: 'Explore the aisles peacefully without a companion following you.',
            color: 'from-zinc-700 to-zinc-900 border-white/20',
        },
    ];

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isPetSelectorOpen) {
                handleClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPetSelectorOpen, handleClose]);

    if (!isPetSelectorOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6 backdrop-blur-2xl animate-in fade-in duration-200 select-none">
            <div className="relative flex flex-col w-full max-w-2xl rounded-3xl border border-orange-500/30 bg-gradient-to-b from-[#1c120c]/95 to-[#080504]/95 p-6 md:p-8 shadow-2xl backdrop-blur-2xl">
                <button
                    onClick={handleClose}
                    className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all"
                >
                    ✕
                </button>

                <div className="flex items-center gap-3 border-b border-orange-500/20 pb-4 mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/20 border border-orange-400/40 text-orange-300 font-bold font-mono">
                        PET
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-white">
                            Anime Familiar & Companion
                        </h2>
                        <p className="text-xs text-orange-400 font-medium">
                            Choose a 3D companion that follows you through the bookstore
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {pets.map((p) => {
                        const isSelected = activePet === p.id;
                        return (
                            <button
                                key={p.id}
                                onClick={() => {
                                    setActivePet(p.id);
                                    handleClose();
                                }}
                                className={`group relative flex flex-col p-4 rounded-2xl border transition-all text-left ${
                                    isSelected
                                        ? `bg-white/10 ${p.color} ring-2 ring-orange-400 shadow-xl`
                                        : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-sm font-bold text-white group-hover:text-orange-300 transition-colors">
                                        {p.name}
                                    </h4>
                                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                                        {p.element}
                                    </span>
                                </div>
                                <span className="text-[11px] text-white/50 mb-2">{p.nameJp}</span>
                                <p className="text-xs text-white/70 leading-relaxed">{p.desc}</p>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
