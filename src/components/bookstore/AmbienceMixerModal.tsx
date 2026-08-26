'use client';

import { useBookstoreStore } from '@/store/bookstoreStore';
import { useCallback, useEffect, useRef, useState } from 'react';

interface AmbienceTrack {
    id: string;
    name: string;
    nameJp: string;
    desc: string;
    defaultVol: number;
    color: string;
}

export default function AmbienceMixerModal() {
    const { isAmbienceMixerOpen, setAmbienceMixerOpen, isAudioPlaying } = useBookstoreStore();
    const [volumes, setVolumes] = useState<Record<string, number>>({
        rain: 60,
        vinyl: 40,
        chimes: 50,
        traffic: 20,
        cafe: 35,
        pages: 30,
    });
    const audioCtxRef = useRef<AudioContext | null>(null);
    const nodesRef = useRef<Record<string, { gain: GainNode }>>({});

    const tracks: AmbienceTrack[] = [
        { id: 'rain', name: 'Rain on Glass Ceiling', nameJp: 'ガラス屋根の雨音', desc: 'Gentle raindrops tapping on the bookstore skylight.', defaultVol: 60, color: 'text-sky-400' },
        { id: 'vinyl', name: 'Vinyl Dust Crackle', nameJp: 'レコードノイズ', desc: 'Warm analog needle friction and surface pops.', defaultVol: 40, color: 'text-amber-400' },
        { id: 'chimes', name: 'Bamboo Wind Chimes', nameJp: '竹風鈴の響き', desc: 'Distant pentatonic wind chimes floating from the rooftop.', defaultVol: 50, color: 'text-emerald-400' },
        { id: 'traffic', name: 'Shibuya Midnight Distant', nameJp: '渋谷夜景の残響', desc: 'Soft low-frequency highway hum in the night distance.', defaultVol: 20, color: 'text-violet-400' },
        { id: 'cafe', name: 'Barista Steam & Cups', nameJp: 'カフェの温もり', desc: 'Gentle espresso bar hissing and ceramic clinking.', defaultVol: 35, color: 'text-rose-400' },
        { id: 'pages', name: 'Manga Page Rustle', nameJp: 'ページをめくる音', desc: 'Delicate paper rustling from quiet readers nearby.', defaultVol: 30, color: 'text-teal-400' },
    ];

    const handleClose = useCallback(() => {
        setAmbienceMixerOpen(false);
    }, [setAmbienceMixerOpen]);

    const updateVolume = (id: string, val: number) => {
        setVolumes((prev) => ({ ...prev, [id]: val }));
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isAmbienceMixerOpen) {
                handleClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isAmbienceMixerOpen, handleClose]);

    if (!isAmbienceMixerOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6 backdrop-blur-2xl animate-in fade-in duration-200 select-none">
            <div className="relative flex flex-col w-full max-w-2xl rounded-3xl border border-teal-500/30 bg-gradient-to-b from-[#0e2022]/95 to-[#040c0d]/95 p-6 md:p-8 shadow-2xl backdrop-blur-2xl">
                <button
                    onClick={handleClose}
                    className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all"
                >
                    ✕
                </button>

                <div className="flex items-center gap-3 border-b border-teal-500/20 pb-4 mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/20 border border-teal-400/40 text-teal-300 font-bold font-mono">
                        MIX
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-white">
                            Tokyo Soundscape Ambience Mixer
                        </h2>
                        <p className="text-xs text-teal-400 font-medium">
                            Multi-Layer Spatial Environmental Audio Synthesis
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    {tracks.map((t) => {
                        const vol = volumes[t.id] ?? t.defaultVol;
                        return (
                            <div
                                key={t.id}
                                className="flex flex-col p-3.5 rounded-2xl border border-white/10 bg-white/5 space-y-2"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-xs font-bold text-white">
                                            {t.name}
                                        </h4>
                                        <span className="text-[10px] text-white/40 block">
                                            {t.nameJp}
                                        </span>
                                    </div>
                                    <span className={`font-mono text-xs font-bold ${t.color}`}>
                                        {vol}%
                                    </span>
                                </div>

                                <input
                                    type="range"
                                    min={0}
                                    max={100}
                                    value={vol}
                                    onChange={(e) => updateVolume(t.id, parseInt(e.target.value, 10))}
                                    className="w-full accent-teal-400 cursor-pointer h-1.5 bg-black/40 rounded-lg"
                                />
                            </div>
                        );
                    })}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <span className="text-xs text-white/50">
                        {isAudioPlaying ? 'Global Audio Active' : 'Global Audio Muted (Toggle with Sound HUD)'}
                    </span>
                    <button
                        onClick={handleClose}
                        className="px-6 py-2.5 rounded-xl bg-teal-400 text-black font-bold uppercase tracking-wider text-xs shadow-lg hover:bg-teal-300 transition-all"
                    >
                        Apply Soundscape
                    </button>
                </div>
            </div>
        </div>
    );
}
