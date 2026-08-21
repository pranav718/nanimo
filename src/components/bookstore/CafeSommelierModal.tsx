'use client';

import { useBookstoreStore } from '@/store/bookstoreStore';
import { AnimeMedia } from '@/types';
import { useCallback, useEffect, useState } from 'react';

export default function CafeSommelierModal() {
    const {
        isCafeOpen,
        setCafeOpen,
        getCafeRecommendation,
        setInspectedMedia,
        toggleSaveMedia,
        isMediaSaved,
    } = useBookstoreStore();

    const [selectedDrink, setSelectedDrink] = useState('Matcha Latte');
    const [selectedMood, setSelectedMood] = useState('cozy');
    const [servedItem, setServedItem] = useState<AnimeMedia | null>(null);
    const [isBrewing, setIsBrewing] = useState(false);

    const handleClose = useCallback(() => {
        setCafeOpen(false);
        setServedItem(null);
        setIsBrewing(false);
    }, [setCafeOpen]);

    const handleBrew = () => {
        setIsBrewing(true);
        setTimeout(() => {
            const rec = getCafeRecommendation(selectedMood);
            setServedItem(rec);
            setIsBrewing(false);
        }, 600);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                handleClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleClose]);

    if (!isCafeOpen) return null;

    const drinks = [
        { id: 'matcha', name: 'Ceremonial Matcha Latte', desc: 'Creamy Uji green tea with silky foam' },
        { id: 'espresso', name: 'Kyoto Dark Roast', desc: 'Intense slow-dripped espresso blend' },
        { id: 'hojicha', name: 'Hojicha Caramel Tea', desc: 'Nutty roasted green tea with amber caramel' },
        { id: 'sakura', name: 'Sakura Blossom Tea', desc: 'Delicate floral infusion with honey' },
    ];

    const moods = [
        { id: 'cozy', label: 'Wholesome & Cozy', desc: 'Heartwarming, peaceful, relaxing' },
        { id: 'hype', label: 'Pure Hype & Action', desc: 'Adrenaline, battles, intense triumphs' },
        { id: 'romance', label: 'Heartfelt Romance', desc: 'Sweet feelings, butterflies, emotional bonds' },
        { id: 'mystery', label: 'Dark Mind-Games', desc: 'Psychological thriller, secrets, suspense' },
        { id: 'isekai', label: 'Fantasy Escapism', desc: 'Magic kingdoms, monsters, epic journeys' },
        { id: 'cyber', label: 'Cyberpunk & Sci-Fi', desc: 'Futuristic worlds, technology, dystopia' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6 backdrop-blur-2xl animate-in fade-in duration-200">
            <div className="relative flex flex-col w-full max-w-2xl max-h-[88vh] rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-[#0d2818]/95 to-[#06120b]/95 p-6 md:p-8 shadow-2xl backdrop-blur-2xl overflow-y-auto">
                <button
                    onClick={handleClose}
                    className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all"
                >
                    ✕
                </button>

                <div className="flex items-center gap-3 border-b border-emerald-500/20 pb-4 mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-bold">
                        AOI
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-white">
                            Cafe Nanimo Sommelier
                        </h2>
                        <p className="text-xs text-emerald-400 font-medium">
                            Barista Aoi • &quot;What are you in the mood for today?&quot;
                        </p>
                    </div>
                </div>

                {!servedItem ? (
                    <div className="flex flex-col gap-6">
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-emerald-300 mb-2.5 block">
                                Step 1: Select Your Beverage
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {drinks.map((d) => (
                                    <button
                                        key={d.id}
                                        onClick={() => setSelectedDrink(d.name)}
                                        className={`p-3 rounded-2xl border text-left transition-all ${
                                            selectedDrink === d.name
                                                ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-lg shadow-emerald-500/10'
                                                : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                                        }`}
                                    >
                                        <h4 className="text-xs font-bold text-white">{d.name}</h4>
                                        <p className="text-[11px] text-white/50 mt-0.5">{d.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-emerald-300 mb-2.5 block">
                                Step 2: Choose Your Reading / Watching Mood
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {moods.map((m) => (
                                    <button
                                        key={m.id}
                                        onClick={() => setSelectedMood(m.id)}
                                        className={`p-3 rounded-2xl border text-left transition-all ${
                                            selectedMood === m.id
                                                ? 'bg-amber-400/20 border-amber-400 text-white shadow-lg shadow-amber-400/10'
                                                : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                                        }`}
                                    >
                                        <h4 className="text-xs font-bold text-white">{m.label}</h4>
                                        <p className="text-[11px] text-white/50 mt-0.5">{m.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleBrew}
                            disabled={isBrewing}
                            className="mt-2 w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold uppercase tracking-wider text-xs shadow-lg hover:from-emerald-400 hover:to-teal-500 transition-all disabled:opacity-50"
                        >
                            {isBrewing ? 'Brewing Cup & Pairing Recommendation...' : 'Brew Beverage & Reveal Pairing'}
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
                        <div className="rounded-full bg-emerald-500/20 border border-emerald-400/40 px-4 py-1 text-xs font-bold text-emerald-300 uppercase tracking-widest mb-4">
                            Served: {selectedDrink}
                        </div>

                        <div
                            className="h-56 w-36 rounded-2xl bg-cover bg-center shadow-2xl border-2 border-emerald-400/40 mb-4"
                            style={{
                                backgroundImage: `url(${servedItem.coverImage.extraLarge || servedItem.coverImage.large})`,
                            }}
                        />

                        <h3 className="text-xl font-bold text-white mb-1">
                            {servedItem.title.english || servedItem.title.romaji}
                        </h3>

                        <p className="text-xs text-amber-300 font-semibold mb-3">
                            Score: {servedItem.averageScore ? `${servedItem.averageScore}%` : 'N/A'} • {servedItem.genres.join(', ')}
                        </p>

                        <p className="text-xs text-white/70 max-w-lg line-clamp-3 leading-relaxed mb-6">
                            {servedItem.description?.replace(/<[^>]*>?/gm, '') || 'No synopsis.'}
                        </p>

                        <div className="flex flex-col w-full gap-2.5">
                            <button
                                onClick={() => {
                                    setInspectedMedia(servedItem);
                                    handleClose();
                                }}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold uppercase tracking-wider text-xs shadow-lg hover:from-emerald-400 hover:to-teal-500 transition-all"
                            >
                                Inspect Full Volume
                            </button>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => toggleSaveMedia(servedItem)}
                                    className={`flex-1 py-2.5 rounded-xl border text-xs font-semibold uppercase tracking-wider transition-all ${
                                        isMediaSaved(servedItem.id)
                                            ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                                            : 'bg-white/5 border-white/15 text-white/80 hover:bg-white/10'
                                    }`}
                                >
                                    {isMediaSaved(servedItem.id) ? 'Saved in My Shelf' : 'Save to Shelf'}
                                </button>
                                <button
                                    onClick={() => setServedItem(null)}
                                    className="flex-1 py-2.5 rounded-xl border border-white/15 bg-white/5 text-white/80 hover:bg-white/10 text-xs font-semibold uppercase tracking-wider transition-all"
                                >
                                    Order Another Drink
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
