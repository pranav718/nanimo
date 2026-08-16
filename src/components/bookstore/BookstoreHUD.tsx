'use client';

import { useBookstoreStore } from '@/store/bookstoreStore';

export default function BookstoreHUD() {
    const {
        currentFloor,
        proximityTarget,
        isLoading,
    } = useBookstoreStore();

    const floorNames: Record<number, { en: string; jp: string }> = {
        1: { en: 'Manga Sanctuary', jp: '漫画フロア' },
        2: { en: 'Anime Screening Lounge', jp: 'アニメシアター' },
        3: { en: 'Rooftop Showcase', jp: '屋上テラス' },
    };

    const current = floorNames[currentFloor] || floorNames[1];

    return (
        <div className="pointer-events-none fixed inset-0 z-10 flex flex-col justify-between p-6 md:p-8">
            <div className="flex items-start justify-between">
                <div className="flex flex-col">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white/95">
                            何も
                        </h1>
                        <span className="rounded-full border border-white/20 bg-white/10 px-3 py-0.5 text-xs font-medium tracking-widest text-amber-300 backdrop-blur-md">
                            {currentFloor}F
                        </span>
                    </div>
                    <p className="mt-1 text-xs tracking-widest text-white/50 uppercase">
                        {current.en} • {current.jp}
                    </p>
                </div>

                {isLoading && (
                    <div className="rounded-full border border-white/20 bg-black/60 px-4 py-1.5 text-xs text-white/70 backdrop-blur-md animate-pulse">
                        Loading Archive...
                    </div>
                )}
            </div>

            {proximityTarget && (
                <div className="self-center animate-bounce">
                    <div className="flex items-center gap-3 rounded-full border border-amber-400/50 bg-black/80 px-6 py-2.5 shadow-2xl backdrop-blur-md">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-xs font-black text-black">
                            E
                        </span>
                        <span className="text-sm font-semibold tracking-wide text-white">
                            Inspect {proximityTarget.name}
                        </span>
                    </div>
                </div>
            )}

            <div className="hidden md:flex items-center justify-between text-[11px] tracking-wider text-white/40">
                <div className="flex items-center gap-4 rounded-full border border-white/10 bg-black/40 px-4 py-1.5 backdrop-blur-sm">
                    <span>WASD / Arrows to Move</span>
                    <span>•</span>
                    <span>Shift to Sprint</span>
                    <span>•</span>
                    <span>Space to Jump</span>
                    <span>•</span>
                    <span>Mouse Drag to Look</span>
                </div>
                <div className="rounded-full border border-white/10 bg-black/40 px-3 py-1.5 backdrop-blur-sm">
                    NANIMO 3D ARCHIVE
                </div>
            </div>
        </div>
    );
}
