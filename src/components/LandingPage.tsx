'use client';

import { useAnimeStore } from '@/store/animeStore';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import MediaToggle from './MediaToggle';

const BlackHoleScene = dynamic(() => import('./BlackHoleScene'), {
    ssr: false,
    loading: () => (
        <div className="fixed inset-0 bg-black flex items-center justify-center">
            <div className="text-white/30 text-sm">Loading...</div>
        </div>
    ),
});

export default function LandingPage() {
    const router = useRouter();
    const { mediaType } = useAnimeStore();
    const [isEntering, setIsEntering] = useState(false);
    const [showUI, setShowUI] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setShowUI(true), 500);
        return () => clearTimeout(timer);
    }, []);

    const handleEnter = useCallback(() => {
        if (isEntering) return;
        setIsEntering(true);

        setTimeout(() => {
            router.push('/explore');
        }, 500);
    }, [router, isEntering]);

    const ctaText = mediaType === 'ANIME'
        ? 'fall into anime'
        : 'fall into manga';

    return (
        <main className="relative w-screen h-screen overflow-hidden bg-black">
            <BlackHoleScene onEnter={handleEnter} isExpanding={isEntering} />

            <div
                className={`absolute top-8 left-8 z-10 transition-opacity duration-1000 ${showUI ? 'opacity-100' : 'opacity-0'
                    }`}
            >
                <h1 className="text-5xl font-bold text-white/90 tracking-tight">
                    何も
                </h1>
                <p className="text-sm text-white/40 mt-1 tracking-widest">
                    NANIMO
                </p>
            </div>

            <div
                className={`absolute top-8 right-8 z-10 transition-opacity duration-1000 ${showUI ? 'opacity-100' : 'opacity-0'
                    }`}
            >
                <MediaToggle />
            </div>

            <div
                className={`absolute bottom-16 left-1/2 -translate-x-1/2 z-10 transition-all duration-500 ${showUI && !isEntering ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    }`}
            >
                <button
                    onClick={handleEnter}
                    className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/20 
                               rounded-full text-white/70 hover:text-white text-sm tracking-wider
                               transition-all duration-300 backdrop-blur-sm"
                >
                    {ctaText}
                </button>
            </div>

            <div
                className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-10 transition-opacity duration-1000 ${showUI && !isEntering ? 'opacity-100' : 'opacity-0'
                    }`}
            >
                <p className="text-xs text-white/20">
                    drag to look around
                </p>
            </div>

        </main>
    );
}
