import { fetchAllBookstoreGenres, fetchTrendingMedia } from '@/lib/anilist';
import { AnimeMedia, BookstoreGenre, FloorLevel } from '@/types';
import { create } from 'zustand';

export interface AvatarCustomizationState {
    hairColor: string;
    hoodieColor: string;
    pantsColor: string;
}

export interface ProximityTarget {
    type: 'shelf' | 'cinema' | 'elevator' | 'podium';
    id: string;
    name: string;
    genre?: BookstoreGenre;
    media?: AnimeMedia;
}

interface BookstoreStore {
    currentFloor: FloorLevel;
    activeGenre: BookstoreGenre | null;
    mangaGenres: Record<BookstoreGenre, AnimeMedia[]>;
    animeGenres: Record<BookstoreGenre, AnimeMedia[]>;
    trendingAnime: AnimeMedia[];
    trendingManga: AnimeMedia[];
    isLoading: boolean;
    error: string | null;
    inspectedMedia: AnimeMedia | null;
    proximityTarget: ProximityTarget | null;
    isAudioPlaying: boolean;
    isFastTravelOpen: boolean;
    isHelpOpen: boolean;
    isWardrobeOpen: boolean;
    isSearchOpen: boolean;
    playerPosition: [number, number, number];
    isElevatorMoving: boolean;
    avatarCustomization: AvatarCustomizationState;

    setCurrentFloor: (floor: FloorLevel) => void;
    setActiveGenre: (genre: BookstoreGenre | null) => void;
    setInspectedMedia: (media: AnimeMedia | null) => void;
    setProximityTarget: (target: ProximityTarget | null) => void;
    toggleAudio: () => void;
    setFastTravelOpen: (open: boolean) => void;
    setHelpOpen: (open: boolean) => void;
    setWardrobeOpen: (open: boolean) => void;
    setSearchOpen: (open: boolean) => void;
    setPlayerPosition: (position: [number, number, number]) => void;
    setIsElevatorMoving: (moving: boolean) => void;
    setAvatarCustomization: (custom: Partial<AvatarCustomizationState>) => void;
    loadBookstoreData: () => Promise<void>;
}

const defaultGenreRecord: Record<BookstoreGenre, AnimeMedia[]> = {
    Romance: [],
    Action: [],
    Fantasy: [],
    'Sci-Fi': [],
    Mystery: [],
    'Slice of Life': [],
};

export const useBookstoreStore = create<BookstoreStore>((set, get) => ({
    currentFloor: 1,
    activeGenre: null,
    mangaGenres: defaultGenreRecord,
    animeGenres: defaultGenreRecord,
    trendingAnime: [],
    trendingManga: [],
    isLoading: false,
    error: null,
    inspectedMedia: null,
    proximityTarget: null,
    isAudioPlaying: false,
    isFastTravelOpen: false,
    isHelpOpen: false,
    isWardrobeOpen: false,
    isSearchOpen: false,
    playerPosition: [0, 0, 0],
    isElevatorMoving: false,
    avatarCustomization: {
        hairColor: '#1a1a24',
        hoodieColor: '#2563eb',
        pantsColor: '#1e293b',
    },

    setCurrentFloor: (floor: FloorLevel) => {
        set({ currentFloor: floor });
    },

    setActiveGenre: (genre: BookstoreGenre | null) => {
        set({ activeGenre: genre });
    },

    setInspectedMedia: (media: AnimeMedia | null) => {
        set({ inspectedMedia: media });
    },

    setProximityTarget: (target: ProximityTarget | null) => {
        set({ proximityTarget: target });
    },

    toggleAudio: () => {
        set((state) => ({ isAudioPlaying: !state.isAudioPlaying }));
    },

    setFastTravelOpen: (open: boolean) => {
        set({ isFastTravelOpen: open });
    },

    setHelpOpen: (open: boolean) => {
        set({ isHelpOpen: open });
    },

    setWardrobeOpen: (open: boolean) => {
        set({ isWardrobeOpen: open });
    },

    setSearchOpen: (open: boolean) => {
        set({ isSearchOpen: open });
    },

    setPlayerPosition: (position: [number, number, number]) => {
        set({ playerPosition: position });
    },

    setIsElevatorMoving: (moving: boolean) => {
        set({ isElevatorMoving: moving });
    },

    setAvatarCustomization: (custom: Partial<AvatarCustomizationState>) => {
        set((state) => ({
            avatarCustomization: { ...state.avatarCustomization, ...custom },
        }));
    },

    loadBookstoreData: async () => {
        const { mangaGenres, animeGenres } = get();
        if (mangaGenres.Romance.length > 0 && animeGenres.Romance.length > 0) return;

        set({ isLoading: true, error: null });

        try {
            const [mangaData, animeData, trendingAnimeRes, trendingMangaRes] = await Promise.all([
                fetchAllBookstoreGenres('MANGA'),
                fetchAllBookstoreGenres('ANIME'),
                fetchTrendingMedia('ANIME', 1, 20),
                fetchTrendingMedia('MANGA', 1, 20),
            ]);

            set({
                mangaGenres: mangaData,
                animeGenres: animeData,
                trendingAnime: trendingAnimeRes.media,
                trendingManga: trendingMangaRes.media,
                isLoading: false,
            });
        } catch (err) {
            set({
                error: err instanceof Error ? err.message : 'Failed to load bookstore data',
                isLoading: false,
            });
        }
    },
}));
