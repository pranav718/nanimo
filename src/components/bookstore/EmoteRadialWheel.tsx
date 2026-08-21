'use client';

import { AvatarEmote } from './CharacterAvatar';
import { useBookstoreStore } from '@/store/bookstoreStore';
import { useCallback, useEffect } from 'react';

export default function EmoteRadialWheel() {
    const { isEmoteWheelOpen, setEmoteWheelOpen, playEmote } = useBookstoreStore();

    const handleClose = useCallback(() => {
        setEmoteWheelOpen(false);
    }, [setEmoteWheelOpen]);

    const handleTrigger = (emote: AvatarEmote) => {
        playEmote(emote);
        handleClose();
    };

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            if (e.key === 'x' || e.key === 'X') {
                setEmoteWheelOpen(!isEmoteWheelOpen);
            } else if (e.key === 'Escape' && isEmoteWheelOpen) {
                handleClose();
            }
        },
        [isEmoteWheelOpen, setEmoteWheelOpen, handleClose]
    );

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    if (!isEmoteWheelOpen) return null;

    const emotes: { id: AvatarEmote; name: string; nameJp: string; key: string }[] = [
        { id: 'wave', name: 'Wave / Greet', nameJp: '手を振る', key: '1' },
        { id: 'read', name: 'Read Volume', nameJp: '読書', key: '2' },
        { id: 'dance', name: 'Dance Groove', nameJp: 'ダンス', key: '3' },
        { id: 'cheer', name: 'Hype Cheer', nameJp: '歓喜', key: '4' },
        { id: 'think', name: 'Ponder / Think', nameJp: '思考', key: '5' },
        { id: 'bow', name: 'Polite Bow', nameJp: 'お辞儀', key: '6' },
    ];

    return (
        <div
            onClick={handleClose}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xl animate-in fade-in duration-150 select-none"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative flex flex-col items-center justify-center w-80 h-80 rounded-full border border-white/20 bg-gradient-to-b from-[#1c1815]/95 to-[#080706]/95 p-6 shadow-2xl backdrop-blur-2xl"
            >
                <div className="absolute inset-0 rounded-full bg-radial from-amber-500/10 via-transparent to-transparent pointer-events-none" />

                <div className="text-center mb-1">
                    <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase">
                        Avatar Emotes
                    </span>
                    <h3 className="text-xs text-white/50 uppercase font-semibold tracking-wider">
                        Press X or Select
                    </h3>
                </div>

                <div className="grid grid-cols-2 gap-2.5 w-full mt-2">
                    {emotes.map((em) => (
                        <button
                            key={em.id}
                            onClick={() => handleTrigger(em.id)}
                            className="group flex flex-col items-center justify-center p-2.5 rounded-2xl border border-white/10 bg-white/5 hover:bg-amber-400/20 hover:border-amber-400/60 transition-all text-center"
                        >
                            <span className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                                {em.name}
                            </span>
                            <span className="text-[10px] text-white/40 group-hover:text-white/60">
                                {em.nameJp}
                            </span>
                        </button>
                    ))}
                </div>

                <button
                    onClick={handleClose}
                    className="mt-3 text-[10px] text-white/40 hover:text-white uppercase tracking-widest transition-colors"
                >
                    Cancel (ESC)
                </button>
            </div>
        </div>
    );
}
