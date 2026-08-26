import { fetchAllBookstoreGenres, fetchTrendingMedia } from '@/lib/anilist';
import { AtmospherePreset } from '@/components/bookstore/AtmospherePresets';
import { AvatarEmote } from '@/components/bookstore/CharacterAvatar';
import { PetCompanionType } from '@/components/bookstore/AvatarPetCompanion3D';
import { AnimeMedia, BookstoreGenre, FloorLevel } from '@/types';
import { create } from 'zustand';

export interface AvatarCustomizationState {
    hairColor: string;
    hoodieColor: string;
    pantsColor: string;
}

export interface ProximityTarget {
    type: 'shelf' | 'cinema' | 'elevator' | 'podium' | 'gachapon' | 'jukebox' | 'personalshelf' | 'cafe' | 'seat' | 'quiz' | 'terminal' | 'soundboard' | 'sketchpad' | 'synth' | 'pond' | 'radio' | 'nook' | 'arcade' | 'telescope' | 'shrine' | 'teacart' | 'dj' | 'postbox' | 'trophy' | 'bonsai' | 'fireworks' | 'origami' | 'metrogate' | 'vending' | 'karaoke' | 'neonboard';
    id: string;
    name: string;
    genre?: BookstoreGenre;
    media?: AnimeMedia;
    seatPos?: [number, number, number];
}

interface BookstoreStore {
    currentFloor: FloorLevel;
    activeGenre: BookstoreGenre | null;
    mangaGenres: Record<BookstoreGenre, AnimeMedia[]>;
    animeGenres: Record<BookstoreGenre, AnimeMedia[]>;
    trendingAnime: AnimeMedia[];
    trendingManga: AnimeMedia[];
    savedMedia: AnimeMedia[];
    visitedFloors: number[];
    hasRolledGachapon: boolean;
    hasOrderedCafe: boolean;
    hasTakenQuiz: boolean;
    isLoading: boolean;
    error: string | null;
    inspectedMedia: AnimeMedia | null;
    proximityTarget: ProximityTarget | null;
    isAudioPlaying: boolean;
    isFastTravelOpen: boolean;
    isHelpOpen: boolean;
    isWardrobeOpen: boolean;
    isSearchOpen: boolean;
    isBookmarksOpen: boolean;
    isGachaponOpen: boolean;
    isReaderOpen: boolean;
    isCafeOpen: boolean;
    isSittingCinema: boolean;
    isPhotoMode: boolean;
    isQuizOpen: boolean;
    isEmoteWheelOpen: boolean;
    isExportOpen: boolean;
    isSoundboardOpen: boolean;
    isPassportOpen: boolean;
    isSynthOpen: boolean;
    isSketchpadOpen: boolean;
    isPetSelectorOpen: boolean;
    isRadioOpen: boolean;
    activeRadioStation: number;
    isReadingGoalOpen: boolean;
    readingGoalChapters: number;
    readingChaptersCompleted: number;
    readingStreakDays: number;
    isTriviaArcadeOpen: boolean;
    isTelescopeOpen: boolean;
    isFortuneOpen: boolean;
    isTeaCartOpen: boolean;
    isDJOpen: boolean;
    isPostcardOpen: boolean;
    isAmbienceMixerOpen: boolean;
    isTrophyOpen: boolean;
    isFireworksOpen: boolean;
    isOrigamiOpen: boolean;
    isMetroCardOpen: boolean;
    isVendingOpen: boolean;
    isKaraokeOpen: boolean;
    isNeonBoardOpen: boolean;
    activePet: PetCompanionType;
    activeEmote: AvatarEmote;
    readingMedia: AnimeMedia | null;
    isFirstPerson: boolean;
    atmospherePreset: AtmospherePreset;
    gachaponResult: AnimeMedia | null;
    activeJukeboxStation: number;
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
    setBookmarksOpen: (open: boolean) => void;
    setGachaponOpen: (open: boolean) => void;
    setReaderOpen: (open: boolean) => void;
    setCafeOpen: (open: boolean) => void;
    setSittingCinema: (sitting: boolean) => void;
    setPhotoMode: (open: boolean) => void;
    setQuizOpen: (open: boolean) => void;
    setEmoteWheelOpen: (open: boolean) => void;
    setExportOpen: (open: boolean) => void;
    setSoundboardOpen: (open: boolean) => void;
    setPassportOpen: (open: boolean) => void;
    setSynthOpen: (open: boolean) => void;
    setSketchpadOpen: (open: boolean) => void;
    setPetSelectorOpen: (open: boolean) => void;
    setRadioOpen: (open: boolean) => void;
    setActiveRadioStation: (idx: number) => void;
    setReadingGoalOpen: (open: boolean) => void;
    setReadingGoalChapters: (count: number) => void;
    setReadingChaptersCompleted: (count: number) => void;
    setTriviaArcadeOpen: (open: boolean) => void;
    setTelescopeOpen: (open: boolean) => void;
    setFortuneOpen: (open: boolean) => void;
    setTeaCartOpen: (open: boolean) => void;
    setDJOpen: (open: boolean) => void;
    setPostcardOpen: (open: boolean) => void;
    setAmbienceMixerOpen: (open: boolean) => void;
    setTrophyOpen: (open: boolean) => void;
    setFireworksOpen: (open: boolean) => void;
    setOrigamiOpen: (open: boolean) => void;
    setMetroCardOpen: (open: boolean) => void;
    setVendingOpen: (open: boolean) => void;
    setKaraokeOpen: (open: boolean) => void;
    setNeonBoardOpen: (open: boolean) => void;
    setActivePet: (pet: PetCompanionType) => void;
    playEmote: (emote: AvatarEmote) => void;
    setReadingMedia: (media: AnimeMedia | null) => void;
    toggleFirstPerson: () => void;
    setAtmospherePreset: (preset: AtmospherePreset) => void;
    setGachaponResult: (media: AnimeMedia | null) => void;
    setActiveJukeboxStation: (idx: number) => void;
    toggleSaveMedia: (media: AnimeMedia) => void;
    isMediaSaved: (id: number) => boolean;
    setPlayerPosition: (position: [number, number, number]) => void;
    setIsElevatorMoving: (moving: boolean) => void;
    setAvatarCustomization: (custom: Partial<AvatarCustomizationState>) => void;
    loadBookstoreData: () => Promise<void>;
    rollGachapon: () => AnimeMedia | null;
    getCafeRecommendation: (mood: string) => AnimeMedia | null;
}

const defaultGenreRecord: Record<BookstoreGenre, AnimeMedia[]> = {
    Romance: [],
    Action: [],
    Fantasy: [],
    'Sci-Fi': [],
    Mystery: [],
    'Slice of Life': [],
};

const getInitialSavedMedia = (): AnimeMedia[] => {
    if (typeof window === 'undefined') return [];
    try {
        const item = localStorage.getItem('nanimo_saved_media');
        return item ? JSON.parse(item) : [];
    } catch {
        return [];
    }
};

const getInitialChaptersRead = (): number => {
    if (typeof window === 'undefined') return 3;
    try {
        const item = localStorage.getItem('nanimo_chapters_read');
        return item ? parseInt(item, 10) : 3;
    } catch {
        return 3;
    }
};

export const useBookstoreStore = create<BookstoreStore>((set, get) => ({
    currentFloor: 1,
    activeGenre: null,
    mangaGenres: defaultGenreRecord,
    animeGenres: defaultGenreRecord,
    trendingAnime: [],
    trendingManga: [],
    savedMedia: getInitialSavedMedia(),
    visitedFloors: [1],
    hasRolledGachapon: false,
    hasOrderedCafe: false,
    hasTakenQuiz: false,
    isLoading: false,
    error: null,
    inspectedMedia: null,
    proximityTarget: null,
    isAudioPlaying: false,
    isFastTravelOpen: false,
    isHelpOpen: false,
    isWardrobeOpen: false,
    isSearchOpen: false,
    isBookmarksOpen: false,
    isGachaponOpen: false,
    isReaderOpen: false,
    isCafeOpen: false,
    isSittingCinema: false,
    isPhotoMode: false,
    isQuizOpen: false,
    isEmoteWheelOpen: false,
    isExportOpen: false,
    isSoundboardOpen: false,
    isPassportOpen: false,
    isSynthOpen: false,
    isSketchpadOpen: false,
    isPetSelectorOpen: false,
    isRadioOpen: false,
    activeRadioStation: 0,
    isReadingGoalOpen: false,
    readingGoalChapters: 10,
    readingChaptersCompleted: getInitialChaptersRead(),
    readingStreakDays: 4,
    isTriviaArcadeOpen: false,
    isTelescopeOpen: false,
    isFortuneOpen: false,
    isTeaCartOpen: false,
    isDJOpen: false,
    isPostcardOpen: false,
    isAmbienceMixerOpen: false,
    isTrophyOpen: false,
    isFireworksOpen: false,
    isOrigamiOpen: false,
    isMetroCardOpen: false,
    isVendingOpen: false,
    isKaraokeOpen: false,
    isNeonBoardOpen: false,
    activePet: 'kitsune',
    activeEmote: null,
    readingMedia: null,
    isFirstPerson: false,
    atmospherePreset: 'midnight',
    gachaponResult: null,
    activeJukeboxStation: 0,
    playerPosition: [0, 0, 0],
    isElevatorMoving: false,
    avatarCustomization: {
        hairColor: '#1a1a24',
        hoodieColor: '#2563eb',
        pantsColor: '#1e293b',
    },

    setCurrentFloor: (floor: FloorLevel) => {
        const { visitedFloors } = get();
        const updated = visitedFloors.includes(floor) ? visitedFloors : [...visitedFloors, floor];
        set({ currentFloor: floor, isSittingCinema: false, visitedFloors: updated });
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

    setBookmarksOpen: (open: boolean) => {
        set({ isBookmarksOpen: open });
    },

    setGachaponOpen: (open: boolean) => {
        set({ isGachaponOpen: open });
    },

    setReaderOpen: (open: boolean) => {
        set({ isReaderOpen: open });
    },

    setCafeOpen: (open: boolean) => {
        set({ isCafeOpen: open, hasOrderedCafe: open ? true : get().hasOrderedCafe });
    },

    setSittingCinema: (sitting: boolean) => {
        set({ isSittingCinema: sitting });
    },

    setPhotoMode: (open: boolean) => {
        set({ isPhotoMode: open });
    },

    setQuizOpen: (open: boolean) => {
        set({ isQuizOpen: open, hasTakenQuiz: open ? true : get().hasTakenQuiz });
    },

    setEmoteWheelOpen: (open: boolean) => {
        set({ isEmoteWheelOpen: open });
    },

    setExportOpen: (open: boolean) => {
        set({ isExportOpen: open });
    },

    setSoundboardOpen: (open: boolean) => {
        set({ isSoundboardOpen: open });
    },

    setPassportOpen: (open: boolean) => {
        set({ isPassportOpen: open });
    },

    setSynthOpen: (open: boolean) => {
        set({ isSynthOpen: open });
    },

    setSketchpadOpen: (open: boolean) => {
        set({ isSketchpadOpen: open });
    },

    setPetSelectorOpen: (open: boolean) => {
        set({ isPetSelectorOpen: open });
    },

    setRadioOpen: (open: boolean) => {
        set({ isRadioOpen: open });
    },

    setActiveRadioStation: (idx: number) => {
        set({ activeRadioStation: idx });
    },

    setReadingGoalOpen: (open: boolean) => {
        set({ isReadingGoalOpen: open });
    },

    setReadingGoalChapters: (count: number) => {
        set({ readingGoalChapters: count });
    },

    setReadingChaptersCompleted: (count: number) => {
        set({ readingChaptersCompleted: count });
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem('nanimo_chapters_read', count.toString());
            } catch {}
        }
    },

    setTriviaArcadeOpen: (open: boolean) => {
        set({ isTriviaArcadeOpen: open });
    },

    setTelescopeOpen: (open: boolean) => {
        set({ isTelescopeOpen: open });
    },

    setFortuneOpen: (open: boolean) => {
        set({ isFortuneOpen: open });
    },

    setTeaCartOpen: (open: boolean) => {
        set({ isTeaCartOpen: open });
    },

    setDJOpen: (open: boolean) => {
        set({ isDJOpen: open });
    },

    setPostcardOpen: (open: boolean) => {
        set({ isPostcardOpen: open });
    },

    setAmbienceMixerOpen: (open: boolean) => {
        set({ isAmbienceMixerOpen: open });
    },

    setTrophyOpen: (open: boolean) => {
        set({ isTrophyOpen: open });
    },

    setFireworksOpen: (open: boolean) => {
        set({ isFireworksOpen: open });
    },

    setOrigamiOpen: (open: boolean) => {
        set({ isOrigamiOpen: open });
    },

    setMetroCardOpen: (open: boolean) => {
        set({ isMetroCardOpen: open });
    },

    setVendingOpen: (open: boolean) => {
        set({ isVendingOpen: open });
    },

    setKaraokeOpen: (open: boolean) => {
        set({ isKaraokeOpen: open });
    },

    setNeonBoardOpen: (open: boolean) => {
        set({ isNeonBoardOpen: open });
    },

    setActivePet: (pet: PetCompanionType) => {
        set({ activePet: pet });
    },

    playEmote: (emote: AvatarEmote) => {
        set({ activeEmote: emote });
    },

    setReadingMedia: (media: AnimeMedia | null) => {
        set({ readingMedia: media, isReaderOpen: Boolean(media) });
    },

    toggleFirstPerson: () => {
        set((state) => ({ isFirstPerson: !state.isFirstPerson }));
    },

    setAtmospherePreset: (preset: AtmospherePreset) => {
        set({ atmospherePreset: preset });
    },

    setGachaponResult: (media: AnimeMedia | null) => {
        set({ gachaponResult: media });
    },

    setActiveJukeboxStation: (idx: number) => {
        set({ activeJukeboxStation: idx });
    },

    toggleSaveMedia: (media: AnimeMedia) => {
        const { savedMedia } = get();
        const exists = savedMedia.some((m) => m.id === media.id);
        const updated = exists
            ? savedMedia.filter((m) => m.id !== media.id)
            : [media, ...savedMedia];
        
        set({ savedMedia: updated });
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem('nanimo_saved_media', JSON.stringify(updated));
            } catch {}
        }
    },

    isMediaSaved: (id: number) => {
        return get().savedMedia.some((m) => m.id === id);
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

    rollGachapon: () => {
        const { mangaGenres, animeGenres, trendingAnime, trendingManga } = get();
        const all: AnimeMedia[] = [];
        Object.values(mangaGenres).forEach((l) => all.push(...l));
        Object.values(animeGenres).forEach((l) => all.push(...l));
        all.push(...trendingAnime, ...trendingManga);

        if (all.length === 0) return null;
        const randomItem = all[Math.floor(Math.random() * all.length)];
        set({ gachaponResult: randomItem, isGachaponOpen: true, hasRolledGachapon: true });
        return randomItem;
    },

    getCafeRecommendation: (mood: string) => {
        const { mangaGenres, animeGenres, trendingAnime, trendingManga } = get();
        let targetGenre: BookstoreGenre = 'Slice of Life';

        if (mood === 'cozy') targetGenre = 'Slice of Life';
        else if (mood === 'hype') targetGenre = 'Action';
        else if (mood === 'romance') targetGenre = 'Romance';
        else if (mood === 'mystery') targetGenre = 'Mystery';
        else if (mood === 'isekai') targetGenre = 'Fantasy';
        else if (mood === 'cyber') targetGenre = 'Sci-Fi';

        const pool = [...(mangaGenres[targetGenre] || []), ...(animeGenres[targetGenre] || [])];
        if (pool.length > 0) {
            return pool[Math.floor(Math.random() * pool.length)];
        }
        const fallback = [...trendingAnime, ...trendingManga];
        return fallback.length > 0 ? fallback[0] : null;
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
