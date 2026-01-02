'use client';

import { useAnimeStore } from '@/store/animeStore';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import BlackHole from './BlackHole';
import MediaToggle from './MediaToggle';
import StarField from './StarField';

type WarpState = 'idle' | 'prewarp' | 'warp';

export default function LandingPage() {
    const router = useRouter();
    const { mediaType } = useAnimeStore();
    const [warpState, setWarpState] = useState<WarpState>('idle');

    const handleEnter = useCallback(() => {
        // Pre-warp anticipation (100ms)
        setWarpState('prewarp');

        setTimeout(() => {
            // Start warp
            setWarpState('warp');
        }, 100);
    }, []);

    const handleWarpComplete = useCallback(() => {
        router.push('/explore');
    }, [router]);

    const ctaText = mediaType === 'ANIME'
        ? 'fall into anime'
        : 'fall into manga';

    return (
        <main className="relative w-screen h-screen overflow-hidden bg-[#030305]">
            <StarField
                mode={warpState}
                blackHoleCenter={{ x: window.innerWidth / 2, y: window.innerHeight / 2 }}
                onWarpComplete={handleWarpComplete}
            />

            <div className="absolute top-8 left-8 z-10">
                <h1 className="text-5xl font-bold text-white/90 tracking-tight">
                    何も
                </h1>
                <p className="text-sm text-white/40 mt-1 tracking-widest">
                    NANIMO
                </p>
            </div>

            <div className="absolute top-8 right-8 z-10">
                <MediaToggle />
            </div>

            <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="flex flex-col items-center gap-8">
                    <BlackHole
                        onEnter={handleEnter}
                        isExpanding={warpState === 'prewarp'}
                    />

                    <p
                        className={`text-lg text-white/50 tracking-wide transition-opacity duration-300
                                   ${warpState !== 'idle' ? 'opacity-0' : 'opacity-100'}`}
                    >
                        {ctaText}
                    </p>
                </div>
            </div>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
                <p
                    className={`text-xs text-white/20 transition-opacity duration-300
                               ${warpState !== 'idle' ? 'opacity-0' : 'opacity-100'}`}
                >
                    click to enter
                </p>
            </div>
        </main>
    );
}
