'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
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
    const [showUI, setShowUI] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setShowUI(true), 500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <main className="relative w-screen h-screen overflow-hidden bg-black">
            <BlackHoleScene />

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
                className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-10 transition-opacity duration-1000 ${showUI ? 'opacity-100' : 'opacity-0'
                    }`}
            >
                <p className="text-xs text-white/20">
                    drag to look around
                </p>
            </div>

        </main>
    );
}
