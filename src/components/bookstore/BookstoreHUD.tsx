'use client';

import { AtmospherePreset } from './AtmospherePresets';
import { useBookstoreStore } from '@/store/bookstoreStore';
import { useCallback, useEffect } from 'react';

export default function BookstoreHUD() {
    const {
        currentFloor,
        setCurrentFloor,
        proximityTarget,
        isLoading,
        isAudioPlaying,
        toggleAudio,
        setFastTravelOpen,
        isHelpOpen,
        setHelpOpen,
        setWardrobeOpen,
        setSearchOpen,
        setBookmarksOpen,
        savedMedia,
        isFirstPerson,
        toggleFirstPerson,
        atmospherePreset,
        setAtmospherePreset,
        isPhotoMode,
        setPhotoMode,
        setEmoteWheelOpen,
        setPassportOpen,
        setSynthOpen,
        setSketchpadOpen,
        setPetSelectorOpen,
        setRadioOpen,
        setReadingGoalOpen,
        setTriviaArcadeOpen,
        setTelescopeOpen,
        setFortuneOpen,
        setTeaCartOpen,
        setDJOpen,
        setPostcardOpen,
        setAmbienceMixerOpen,
        setTrophyOpen,
        setFireworksOpen,
        setOrigamiOpen,
        setMetroCardOpen,
        setVendingOpen,
        setKaraokeOpen,
        setNeonBoardOpen,
        setTaikoOpen,
    } = useBookstoreStore();

    const floorNames: Record<number, { en: string; jp: string }> = {
        1: { en: 'Manga Sanctuary', jp: '漫画フロア' },
        2: { en: 'Anime Screening Lounge', jp: 'アニメシアター' },
        3: { en: 'Starlit Rooftop Observatory', jp: '屋上展望台' },
    };

    const current = floorNames[currentFloor] || floorNames[1];

    const cycleAtmosphere = () => {
        const next: Record<AtmospherePreset, AtmospherePreset> = {
            midnight: 'sunset',
            sunset: 'rain',
            rain: 'midnight',
        };
        setAtmospherePreset(next[atmospherePreset] || 'midnight');
    };

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            if (e.key === 'm' || e.key === 'M') {
                setFastTravelOpen(true);
            } else if (e.key === 'c' || e.key === 'C') {
                setWardrobeOpen(true);
            } else if (e.key === 'b' || e.key === 'B') {
                setBookmarksOpen(true);
            } else if (e.key === 'n' || e.key === 'N') {
                setPassportOpen(true);
            } else if (e.key === 'z' || e.key === 'Z') {
                setAmbienceMixerOpen(true);
            } else if (e.key === 'q' || e.key === 'Q') {
                setTrophyOpen(true);
            } else if (e.key === 'h' || e.key === 'H') {
                setFireworksOpen(true);
            } else if (e.key === 'w' || e.key === 'W') {
                setOrigamiOpen(true);
            } else if (e.key === 'r' || e.key === 'R') {
                setRadioOpen(true);
            } else if (e.key === 'g' || e.key === 'G') {
                setReadingGoalOpen(true);
            } else if (e.key === 't' || e.key === 'T') {
                setTriviaArcadeOpen(true);
            } else if (e.key === 'l' || e.key === 'L') {
                setTelescopeOpen(true);
            } else if (e.key === 'f' || e.key === 'F') {
                setFortuneOpen(true);
            } else if (e.key === 'u' || e.key === 'U') {
                setTeaCartOpen(true);
            } else if (e.key === 'y' || e.key === 'Y') {
                setDJOpen(true);
            } else if (e.key === 'i' || e.key === 'I') {
                setPostcardOpen(true);
            } else if (e.key === 'x' || e.key === 'X') {
                setEmoteWheelOpen(true);
            } else if (e.key === 'k' || e.key === 'K') {
                setSynthOpen(true);
            } else if (e.key === 'j' || e.key === 'J') {
                setSketchpadOpen(true);
            } else if (e.key === 'o' || e.key === 'O') {
                setPetSelectorOpen(true);
            } else if (e.key === 'v' || e.key === 'V') {
                toggleFirstPerson();
            } else if (e.key === 'p' || e.key === 'P') {
                setPhotoMode(!isPhotoMode);
            } else if (e.key === '?') {
                setHelpOpen(!isHelpOpen);
            }
        },
        [
            setFastTravelOpen,
            setWardrobeOpen,
            setBookmarksOpen,
            setPassportOpen,
            setAmbienceMixerOpen,
            setTrophyOpen,
            setFireworksOpen,
            setOrigamiOpen,
            setRadioOpen,
            setReadingGoalOpen,
            setTriviaArcadeOpen,
            setTelescopeOpen,
            setFortuneOpen,
            setTeaCartOpen,
            setDJOpen,
            setPostcardOpen,
            setEmoteWheelOpen,
            setSynthOpen,
            setSketchpadOpen,
            setPetSelectorOpen,
            toggleFirstPerson,
            setPhotoMode,
            isPhotoMode,
            setHelpOpen,
            isHelpOpen,
        ]
    );

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    if (isPhotoMode) return null;

    return (
        <>
            <div className="pointer-events-none fixed inset-0 z-20 flex flex-col justify-between p-6 md:p-8">
                <div className="flex items-start justify-between">
                    <div className="pointer-events-auto flex flex-col">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white/95">
                                何も
                            </h1>
                            <div className="flex items-center rounded-full border border-white/20 bg-black/60 p-0.5 backdrop-blur-md">
                                <button
                                    onClick={() => setCurrentFloor(1)}
                                    className={`rounded-full px-3 py-0.5 text-xs font-semibold tracking-wider transition-all ${
                                        currentFloor === 1
                                            ? 'bg-amber-400 text-black shadow-md'
                                            : 'text-white/60 hover:text-white'
                                    }`}
                                >
                                    1F Manga
                                </button>
                                <button
                                    onClick={() => setCurrentFloor(2)}
                                    className={`rounded-full px-3 py-0.5 text-xs font-semibold tracking-wider transition-all ${
                                        currentFloor === 2
                                            ? 'bg-sky-400 text-black shadow-md'
                                            : 'text-white/60 hover:text-white'
                                    }`}
                                >
                                    2F Anime
                                </button>
                                <button
                                    onClick={() => setCurrentFloor(3)}
                                    className={`rounded-full px-3 py-0.5 text-xs font-semibold tracking-wider transition-all ${
                                        currentFloor === 3
                                            ? 'bg-pink-400 text-black shadow-md'
                                            : 'text-white/60 hover:text-white'
                                    }`}
                                >
                                    3F Rooftop
                                </button>
                            </div>
                        </div>
                        <p className="mt-1.5 text-xs tracking-widest text-white/50 uppercase">
                            {current.en} • {current.jp}
                        </p>
                    </div>

                    <div className="pointer-events-auto flex items-center gap-2 mr-40 flex-wrap justify-end">
                        <button
                            onClick={() => setSearchOpen(true)}
                            className="hidden sm:flex items-center gap-1.5 rounded-full border border-white/15 bg-black/50 px-3 py-1.5 text-xs font-semibold tracking-wider text-white/80 hover:bg-white/10 hover:text-white transition-all backdrop-blur-md"
                        >
                            <span>Search</span>
                            <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/60">⌘K</kbd>
                        </button>

                        <button
                            onClick={() => setTaikoOpen(true)}
                            className="hidden sm:flex items-center gap-1.5 rounded-full border border-white/15 bg-black/50 px-3 py-1.5 text-xs font-semibold tracking-wider text-white/80 hover:bg-white/10 hover:text-white transition-all backdrop-blur-md"
                        >
                            <span>Taiko</span>
                        </button>

                        <button
                            onClick={() => setKaraokeOpen(true)}
                            className="hidden sm:flex items-center gap-1.5 rounded-full border border-white/15 bg-black/50 px-3 py-1.5 text-xs font-semibold tracking-wider text-white/80 hover:bg-white/10 hover:text-white transition-all backdrop-blur-md"
                        >
                            <span>Karaoke</span>
                        </button>

                        <button
                            onClick={() => setNeonBoardOpen(true)}
                            className="hidden sm:flex items-center gap-1.5 rounded-full border border-white/15 bg-black/50 px-3 py-1.5 text-xs font-semibold tracking-wider text-white/80 hover:bg-white/10 hover:text-white transition-all backdrop-blur-md"
                        >
                            <span>Neon</span>
                        </button>

                        <button
                            onClick={() => setMetroCardOpen(true)}
                            className="hidden sm:flex items-center gap-1.5 rounded-full border border-white/15 bg-black/50 px-3 py-1.5 text-xs font-semibold tracking-wider text-white/80 hover:bg-white/10 hover:text-white transition-all backdrop-blur-md"
                        >
                            <span>Metro</span>
                        </button>

                        <button
                            onClick={() => setVendingOpen(true)}
                            className="hidden sm:flex items-center gap-1.5 rounded-full border border-white/15 bg-black/50 px-3 py-1.5 text-xs font-semibold tracking-wider text-white/80 hover:bg-white/10 hover:text-white transition-all backdrop-blur-md"
                        >
                            <span>Vending</span>
                        </button>

                        <button
                            onClick={() => setFireworksOpen(true)}
                            className="hidden sm:flex items-center gap-1.5 rounded-full border border-white/15 bg-black/50 px-3 py-1.5 text-xs font-semibold tracking-wider text-white/80 hover:bg-white/10 hover:text-white transition-all backdrop-blur-md"
                        >
                            <span>Hanabi</span>
                            <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/60">H</kbd>
                        </button>

                        <button
                            onClick={() => setOrigamiOpen(true)}
                            className="hidden sm:flex items-center gap-1.5 rounded-full border border-white/15 bg-black/50 px-3 py-1.5 text-xs font-semibold tracking-wider text-white/80 hover:bg-white/10 hover:text-white transition-all backdrop-blur-md"
                        >
                            <span>Origami</span>
                            <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/60">W</kbd>
                        </button>

                        <button
                            onClick={() => setAmbienceMixerOpen(true)}
                            className="hidden sm:flex items-center gap-1.5 rounded-full border border-white/15 bg-black/50 px-3 py-1.5 text-xs font-semibold tracking-wider text-white/80 hover:bg-white/10 hover:text-white transition-all backdrop-blur-md"
                        >
                            <span>Mixer</span>
                            <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/60">Z</kbd>
                        </button>

                        <button
                            onClick={() => setTrophyOpen(true)}
                            className="hidden sm:flex items-center gap-1.5 rounded-full border border-white/15 bg-black/50 px-3 py-1.5 text-xs font-semibold tracking-wider text-white/80 hover:bg-white/10 hover:text-white transition-all backdrop-blur-md"
                        >
                            <span>Relics</span>
                            <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/60">Q</kbd>
                        </button>

                        <button
                            onClick={() => setDJOpen(true)}
                            className="hidden sm:flex items-center gap-1.5 rounded-full border border-white/15 bg-black/50 px-3 py-1.5 text-xs font-semibold tracking-wider text-white/80 hover:bg-white/10 hover:text-white transition-all backdrop-blur-md"
                        >
                            <span>DJ</span>
                            <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/60">Y</kbd>
                        </button>

                        <button
                            onClick={() => setPostcardOpen(true)}
                            className="hidden sm:flex items-center gap-1.5 rounded-full border border-white/15 bg-black/50 px-3 py-1.5 text-xs font-semibold tracking-wider text-white/80 hover:bg-white/10 hover:text-white transition-all backdrop-blur-md"
                        >
                            <span>Post</span>
                            <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/60">I</kbd>
                        </button>

                        <button
                            onClick={() => setTeaCartOpen(true)}
                            className="hidden sm:flex items-center gap-1.5 rounded-full border border-white/15 bg-black/50 px-3 py-1.5 text-xs font-semibold tracking-wider text-white/80 hover:bg-white/10 hover:text-white transition-all backdrop-blur-md"
                        >
                            <span>Tea</span>
                            <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/60">U</kbd>
                        </button>

                        <button
                            onClick={() => setFortuneOpen(true)}
                            className="hidden sm:flex items-center gap-1.5 rounded-full border border-white/15 bg-black/50 px-3 py-1.5 text-xs font-semibold tracking-wider text-white/80 hover:bg-white/10 hover:text-white transition-all backdrop-blur-md"
                        >
                            <span>Fortune</span>
                            <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/60">F</kbd>
                        </button>

                        <button
                            onClick={() => setTriviaArcadeOpen(true)}
                            className="hidden sm:flex items-center gap-1.5 rounded-full border border-white/15 bg-black/50 px-3 py-1.5 text-xs font-semibold tracking-wider text-white/80 hover:bg-white/10 hover:text-white transition-all backdrop-blur-md"
                        >
                            <span>Arcade</span>
                            <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/60">T</kbd>
                        </button>

                        <button
                            onClick={() => setTelescopeOpen(true)}
                            className="hidden sm:flex items-center gap-1.5 rounded-full border border-white/15 bg-black/50 px-3 py-1.5 text-xs font-semibold tracking-wider text-white/80 hover:bg-white/10 hover:text-white transition-all backdrop-blur-md"
                        >
                            <span>Stars</span>
                            <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/60">L</kbd>
                        </button>

                        <button
                            onClick={() => setRadioOpen(true)}
                            className="hidden sm:flex items-center gap-1.5 rounded-full border border-white/15 bg-black/50 px-3 py-1.5 text-xs font-semibold tracking-wider text-white/80 hover:bg-white/10 hover:text-white transition-all backdrop-blur-md"
                        >
                            <span>Radio</span>
                            <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/60">R</kbd>
                        </button>

                        <button
                            onClick={() => setReadingGoalOpen(true)}
                            className="hidden sm:flex items-center gap-1.5 rounded-full border border-white/15 bg-black/50 px-3 py-1.5 text-xs font-semibold tracking-wider text-white/80 hover:bg-white/10 hover:text-white transition-all backdrop-blur-md"
                        >
                            <span>Goal</span>
                            <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/60">G</kbd>
                        </button>

                        <button
                            onClick={() => setSketchpadOpen(true)}
                            className="hidden sm:flex items-center gap-1.5 rounded-full border border-white/15 bg-black/50 px-3 py-1.5 text-xs font-semibold tracking-wider text-white/80 hover:bg-white/10 hover:text-white transition-all backdrop-blur-md"
                        >
                            <span>Sketch</span>
                            <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/60">J</kbd>
                        </button>

                        <button
                            onClick={() => setSynthOpen(true)}
                            className="hidden sm:flex items-center gap-1.5 rounded-full border border-white/15 bg-black/50 px-3 py-1.5 text-xs font-semibold tracking-wider text-white/80 hover:bg-white/10 hover:text-white transition-all backdrop-blur-md"
                        >
                            <span>Synth</span>
                            <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/60">K</kbd>
                        </button>

                        <button
                            onClick={() => setPetSelectorOpen(true)}
                            className="hidden sm:flex items-center gap-1.5 rounded-full border border-white/15 bg-black/50 px-3 py-1.5 text-xs font-semibold tracking-wider text-white/80 hover:bg-white/10 hover:text-white transition-all backdrop-blur-md"
                        >
                            <span>Pet</span>
                            <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/60">O</kbd>
                        </button>

                        <button
                            onClick={() => setPhotoMode(true)}
                            className="hidden sm:flex items-center gap-1.5 rounded-full border border-white/15 bg-black/50 px-3 py-1.5 text-xs font-semibold tracking-wider text-white/80 hover:bg-white/10 hover:text-white transition-all backdrop-blur-md"
                        >
                            <span>Photo</span>
                            <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/60">P</kbd>
                        </button>

                        <button
                            onClick={() => setPassportOpen(true)}
                            className="hidden sm:flex items-center gap-1.5 rounded-full border border-white/15 bg-black/50 px-3 py-1.5 text-xs font-semibold tracking-wider text-white/80 hover:bg-white/10 hover:text-white transition-all backdrop-blur-md"
                        >
                            <span>Passport</span>
                            <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/60">N</kbd>
                        </button>

                        <button
                            onClick={() => setEmoteWheelOpen(true)}
                            className="flex items-center gap-1.5 rounded-full border border-white/15 bg-black/50 px-3 py-1.5 text-xs font-semibold tracking-wider text-white/80 hover:bg-white/10 hover:text-white transition-all backdrop-blur-md"
                        >
                            <span>Emotes</span>
                            <kbd className="hidden sm:inline-block rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/60">X</kbd>
                        </button>

                        <button
                            onClick={toggleFirstPerson}
                            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold tracking-wider transition-all backdrop-blur-md ${
                                isFirstPerson
                                    ? 'border-emerald-400/60 bg-emerald-400/20 text-emerald-300 shadow-md'
                                    : 'border-white/15 bg-black/50 text-white/80 hover:bg-white/10'
                            }`}
                        >
                            <span>{isFirstPerson ? '1st Person' : '3rd Person'}</span>
                            <kbd className="hidden sm:inline-block rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/60">V</kbd>
                        </button>

                        <button
                            onClick={cycleAtmosphere}
                            className="hidden sm:flex items-center gap-1.5 rounded-full border border-white/15 bg-black/50 px-3 py-1.5 text-xs font-semibold tracking-wider text-white/80 hover:bg-white/10 hover:text-white transition-all backdrop-blur-md"
                        >
                            <span className="capitalize">{atmospherePreset}</span>
                        </button>

                        <button
                            onClick={() => setBookmarksOpen(true)}
                            className="flex items-center gap-1.5 rounded-full border border-white/15 bg-black/50 px-3 py-1.5 text-xs font-semibold tracking-wider text-white/80 hover:bg-white/10 hover:text-white transition-all backdrop-blur-md"
                        >
                            <span>My Shelf</span>
                            {savedMedia.length > 0 && (
                                <span className="rounded-full bg-amber-400 px-1.5 py-0.2 text-[10px] font-bold text-black">
                                    {savedMedia.length}
                                </span>
                            )}
                            <kbd className="hidden sm:inline-block rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/60">B</kbd>
                        </button>

                        <button
                            onClick={() => setWardrobeOpen(true)}
                            className="flex items-center gap-1.5 rounded-full border border-white/15 bg-black/50 px-3 py-1.5 text-xs font-semibold tracking-wider text-white/80 hover:bg-white/10 hover:text-white transition-all backdrop-blur-md"
                        >
                            <span>Wardrobe</span>
                            <kbd className="hidden sm:inline-block rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/60">C</kbd>
                        </button>

                        <button
                            onClick={toggleAudio}
                            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold tracking-wider transition-all backdrop-blur-md ${
                                isAudioPlaying
                                    ? 'border-amber-400/60 bg-amber-400/20 text-amber-300 shadow-lg shadow-amber-400/10'
                                    : 'border-white/15 bg-black/50 text-white/60 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            <span>Audio:</span>
                            <span>{isAudioPlaying ? 'ON' : 'OFF'}</span>
                        </button>

                        <button
                            onClick={() => setFastTravelOpen(true)}
                            className="hidden sm:flex items-center gap-1.5 rounded-full border border-white/15 bg-black/50 px-3 py-1.5 text-xs font-semibold tracking-wider text-white/80 hover:bg-white/10 hover:text-white transition-all backdrop-blur-md"
                        >
                            <span>Map</span>
                            <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/60">M</kbd>
                        </button>

                        <button
                            onClick={() => setHelpOpen(true)}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/50 text-xs font-bold text-white/80 hover:bg-white/10 hover:text-white transition-all backdrop-blur-md"
                        >
                            ?
                        </button>
                    </div>
                </div>

                {isLoading && (
                    <div className="self-center rounded-full border border-white/20 bg-black/70 px-5 py-2 text-xs font-medium tracking-widest text-white/80 backdrop-blur-md animate-pulse">
                        Loading Archive...
                    </div>
                )}

                {proximityTarget && (
                    <div className="self-center animate-bounce mb-4">
                        <div className="flex items-center gap-3 rounded-full border border-amber-400/50 bg-black/85 px-6 py-2.5 shadow-2xl backdrop-blur-md">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-xs font-black text-black">
                                E
                            </span>
                            <span className="text-sm font-semibold tracking-wide text-white">
                                {proximityTarget.type === 'elevator'
                                    ? `Step into Glass Elevator (Currently ${currentFloor}F)`
                                    : proximityTarget.type === 'taiko'
                                    ? 'Strike Festival Taiko Drum'
                                    : proximityTarget.type === 'windchime'
                                    ? 'Listen to Furin Glass Wind Chimes'
                                    : proximityTarget.type === 'karaoke'
                                    ? 'Sing Anime Songs in Karaoke Booth'
                                    : proximityTarget.type === 'neonboard'
                                    ? 'Customize Akiba Neon Marquee Sign'
                                    : proximityTarget.type === 'metrogate'
                                    ? 'Tap Tokyo Metro Commuter IC Pass'
                                    : proximityTarget.type === 'vending'
                                    ? 'Buy Chilled Japanese Drink Can'
                                    : proximityTarget.type === 'fireworks'
                                    ? 'Launch Tokyo Rooftop Festival Fireworks'
                                    : proximityTarget.type === 'origami'
                                    ? 'Fold Traditional Japanese Washi Origami'
                                    : proximityTarget.type === 'trophy'
                                    ? 'Inspect Rare Otaku Relics & Trophies'
                                    : proximityTarget.type === 'bonsai'
                                    ? 'Meditate at Rooftop Zen Bonsai Garden'
                                    : proximityTarget.type === 'dj'
                                    ? 'Spin Vinyl Record on DJ Turntables'
                                    : proximityTarget.type === 'postbox'
                                    ? 'Send Custom Tokyo Anime Postcard'
                                    : proximityTarget.type === 'shrine'
                                    ? 'Draw Omikuji Fortune Scroll'
                                    : proximityTarget.type === 'teacart'
                                    ? 'Order Hand-Crafted Matcha Tea & Boba'
                                    : proximityTarget.type === 'arcade'
                                    ? 'Play Anime Trivia Arcade Cabinet'
                                    : proximityTarget.type === 'telescope'
                                    ? 'Gaze Through Cosmic Stargazer Telescope'
                                    : proximityTarget.type === 'radio'
                                    ? 'Tune Vintage Lo-Fi Radio Tower'
                                    : proximityTarget.type === 'nook'
                                    ? 'Sit in Reading Nook Beanbag'
                                    : proximityTarget.type === 'sketchpad'
                                    ? 'Open Manga Artist Sketchpad'
                                    : proximityTarget.type === 'pond'
                                    ? 'Feed Zen Pond Koi Fish'
                                    : proximityTarget.type === 'terminal'
                                    ? 'Open Floor Directory & Fast Travel'
                                    : proximityTarget.type === 'soundboard'
                                    ? 'Open Anime SFX Synthesizer Console'
                                    : proximityTarget.type === 'gachapon'
                                    ? 'Turn Gachapon Machine Crank'
                                    : proximityTarget.type === 'jukebox'
                                    ? 'Toggle Anime Lo-Fi Jukebox'
                                    : proximityTarget.type === 'quiz'
                                    ? 'Take Anime Soul Personality Quiz'
                                    : proximityTarget.type === 'cafe'
                                    ? 'Talk to Barista Aoi'
                                    : `Inspect ${proximityTarget.name}`}
                            </span>
                        </div>
                    </div>
                )}

                <div className="hidden md:flex items-center justify-between text-[11px] tracking-wider text-white/40">
                    <div className="flex items-center gap-4 rounded-full border border-white/10 bg-black/50 px-4 py-1.5 backdrop-blur-md">
                        <span>WASD to Move</span>
                        <span>•</span>
                        <span>H for Hanabi</span>
                        <span>•</span>
                        <span>W for Origami</span>
                        <span>•</span>
                        <span>Z for Mixer</span>
                        <span>•</span>
                        <span>Q for Relics</span>
                    </div>
                    <div className="rounded-full border border-white/10 bg-black/50 px-3 py-1.5 backdrop-blur-md font-mono text-[10px]">
                        NANIMO 3D SPATIAL ARCHIVE
                    </div>
                </div>
            </div>

            {isHelpOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 backdrop-blur-2xl animate-in fade-in duration-200">
                    <div className="relative flex flex-col w-full max-w-lg rounded-3xl border border-white/15 bg-gradient-to-b from-[#181412] to-[#0a0808] p-8 shadow-2xl backdrop-blur-2xl">
                        <button
                            onClick={() => setHelpOpen(false)}
                            className="absolute top-6 right-6 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all"
                        >
                            ✕
                        </button>

                        <h2 className="text-2xl font-bold tracking-tight text-white mb-1">
                            Navigation Guide
                        </h2>
                        <p className="text-xs text-white/40 tracking-wider uppercase mb-6">
                            How to Explore Nanimo Bookstore
                        </p>

                        <div className="flex flex-col gap-3 text-xs">
                            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                                <span className="text-white/80 font-medium">Movement</span>
                                <span className="font-mono text-amber-300">W, A, S, D / Arrow Keys</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                                <span className="text-white/80 font-medium">Taiko Drum Rhythm</span>
                                <span className="font-mono text-amber-300">Play Drum</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                                <span className="text-white/80 font-medium">Karaoke Lounge</span>
                                <span className="font-mono text-amber-300">Sing in Booth</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                                <span className="text-white/80 font-medium">Hanabi Fireworks</span>
                                <span className="font-mono text-amber-300">H</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setHelpOpen(false)}
                            className="mt-6 w-full py-3 rounded-xl bg-amber-400 text-black font-bold uppercase tracking-wider text-xs shadow-lg hover:bg-amber-300 transition-all"
                        >
                            Got It
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
