export interface MediaTitle {
    romaji: string | null;
    english: string | null;
    native: string | null;
}

export interface MediaCoverImage {
    extraLarge: string | null;
    large: string | null;
    medium: string | null;
    color: string | null;
}

export interface MediaTrailer {
    id: string | null;
    site: string | null;
    thumbnail: string | null;
}

export interface AnimeMedia {
    id: number;
    title: MediaTitle;
    coverImage: MediaCoverImage;
    bannerImage?: string | null;
    averageScore: number | null;
    genres: string[];
    description: string | null;
    episodes: number | null;
    chapters: number | null;
    status: string | null;
    format?: string | null;
    seasonYear?: number | null;
    trailer?: MediaTrailer | null;
}

export type MediaType = 'ANIME' | 'MANGA';

export type BookstoreGenre = 
    | 'Romance' 
    | 'Action' 
    | 'Fantasy' 
    | 'Sci-Fi' 
    | 'Mystery' 
    | 'Slice of Life';

export type FloorLevel = 1 | 2 | 3;
