'use client';

import { useBookstoreStore } from '@/store/bookstoreStore';
import { useCallback, useEffect } from 'react';

export default function AvatarCustomizerModal() {
    const { isWardrobeOpen, setWardrobeOpen, avatarCustomization, setAvatarCustomization } = useBookstoreStore();

    const handleClose = useCallback(() => {
        setWardrobeOpen(false);
    }, [setWardrobeOpen]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                handleClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleClose]);

    if (!isWardrobeOpen) return null;

    const hairColors = [
        { label: 'Midnight Black', hex: '#1a1a24' },
        { label: 'Sakura Pink', hex: '#f472b6' },
        { label: 'Electric Cyan', hex: '#06b6d4' },
        { label: 'Platinum Blonde', hex: '#fef08a' },
        { label: 'Crimson Red', hex: '#e11d48' },
        { label: 'Royal Violet', hex: '#a855f7' },
    ];

    const hoodieColors = [
        { label: 'Cobalt Blue', hex: '#2563eb' },
        { label: 'Onyx Dark', hex: '#0f172a' },
        { label: 'Emerald Green', hex: '#059669' },
        { label: 'Sakura Pink', hex: '#ec4899' },
        { label: 'Golden Amber', hex: '#d97706' },
        { label: 'Crimson Red', hex: '#dc2626' },
    ];

    const pantsColors = [
        { label: 'Charcoal Slate', hex: '#1e293b' },
        { label: 'Midnight Jet', hex: '#020617' },
        { label: 'Khaki Stone', hex: '#78716c' },
        { label: 'Denim Indigo', hex: '#1d4ed8' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 backdrop-blur-2xl animate-in fade-in duration-200">
            <div className="relative flex flex-col w-full max-w-md rounded-3xl border border-white/15 bg-gradient-to-b from-[#181412] to-[#0a0808] p-6 md:p-8 shadow-2xl backdrop-blur-2xl">
                <button
                    onClick={handleClose}
                    className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all"
                >
                    ✕
                </button>

                <h2 className="text-2xl font-bold tracking-tight text-white mb-1">
                    Avatar Wardrobe
                </h2>
                <p className="text-xs text-white/40 tracking-wider uppercase mb-6">
                    Customize Hair & Outfit
                </p>

                <div className="flex flex-col gap-5">
                    <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-white/70 mb-2 block">
                            Hair Color
                        </label>
                        <div className="flex flex-wrap gap-2.5">
                            {hairColors.map((c) => (
                                <button
                                    key={c.hex}
                                    onClick={() => setAvatarCustomization({ hairColor: c.hex })}
                                    style={{ backgroundColor: c.hex }}
                                    title={c.label}
                                    className={`h-9 w-9 rounded-full border-2 transition-transform hover:scale-110 ${
                                        avatarCustomization.hairColor === c.hex
                                            ? 'border-white ring-2 ring-amber-400 ring-offset-2 ring-offset-black scale-110'
                                            : 'border-white/20'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-white/70 mb-2 block">
                            Hoodie Color
                        </label>
                        <div className="flex flex-wrap gap-2.5">
                            {hoodieColors.map((c) => (
                                <button
                                    key={c.hex}
                                    onClick={() => setAvatarCustomization({ hoodieColor: c.hex })}
                                    style={{ backgroundColor: c.hex }}
                                    title={c.label}
                                    className={`h-9 w-9 rounded-full border-2 transition-transform hover:scale-110 ${
                                        avatarCustomization.hoodieColor === c.hex
                                            ? 'border-white ring-2 ring-amber-400 ring-offset-2 ring-offset-black scale-110'
                                            : 'border-white/20'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-white/70 mb-2 block">
                            Pants Color
                        </label>
                        <div className="flex flex-wrap gap-2.5">
                            {pantsColors.map((c) => (
                                <button
                                    key={c.hex}
                                    onClick={() => setAvatarCustomization({ pantsColor: c.hex })}
                                    style={{ backgroundColor: c.hex }}
                                    title={c.label}
                                    className={`h-9 w-9 rounded-full border-2 transition-transform hover:scale-110 ${
                                        avatarCustomization.pantsColor === c.hex
                                            ? 'border-white ring-2 ring-amber-400 ring-offset-2 ring-offset-black scale-110'
                                            : 'border-white/20'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleClose}
                    className="mt-8 w-full py-3 rounded-xl bg-amber-400 text-black font-bold uppercase tracking-wider text-xs shadow-lg hover:bg-amber-300 transition-all"
                >
                    Apply & Close
                </button>
            </div>
        </div>
    );
}
