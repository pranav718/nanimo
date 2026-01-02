'use client';

import { useAnimeStore } from '@/store/animeStore';

export default function MediaToggle() {
    const { mediaType, setMediaType } = useAnimeStore();
    const isAnime = mediaType === 'ANIME';

    return (
        <div className="flex items-center gap-3">
            <span
                className={`text-xs font-medium transition-colors duration-200 ${isAnime ? 'text-white' : 'text-white/40'
                    }`}
            >
                ANIME
            </span>

            <button
                onClick={() => setMediaType(isAnime ? 'MANGA' : 'ANIME')}
                className="relative w-12 h-6 rounded-full bg-white/10 border border-white/20 
                           transition-colors duration-200 hover:bg-white/15 focus:outline-none"
                aria-label={`Switch to ${isAnime ? 'manga' : 'anime'}`}
            >
                <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-lg
                               transition-all duration-200 ease-out
                               ${isAnime ? 'left-1' : 'left-6'}`}
                />
            </button>

            <span
                className={`text-xs font-medium transition-colors duration-200 ${!isAnime ? 'text-white' : 'text-white/40'
                    }`}
            >
                MANGA
            </span>
        </div>
    );
}
