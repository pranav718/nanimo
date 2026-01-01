import { fetchAllTrendingMedia } from '@/lib/anilist';
import { AnimeMedia, MediaType } from '@/types';
import { create } from 'zustand';

interface AnimeStore {
    animeList: AnimeMedia[];
    isLoading: boolean;
    error: string | null;
    mediaType: MediaType;

    fetchTrending: () => Promise<void>;
    setMediaType: (type: MediaType) => void;
}

export const useAnimeStore = create<AnimeStore>((set, get) => ({
    animeList: [],
    isLoading: false,
    error: null,
    mediaType: 'ANIME',

    fetchTrending: async () => {
        const { mediaType } = get();
        set({ isLoading: true, error: null });

        try {
            const media = await fetchAllTrendingMedia(mediaType, 10);
            set({ animeList: media, isLoading: false });
        } catch (err) {
            set({
                error: err instanceof Error ? err.message : 'Failed to fetch',
                isLoading: false,
            });
        }
    },

    setMediaType: (type: MediaType) => {
        set({ mediaType: type });
        get().fetchTrending();
    },
}));
