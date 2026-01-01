export interface MediaTitle {
    romaji: string | null;
    english: string | null;
    native: string | null;
}

export interface MediaCoverImage {
    large: string | null;
    medium: string | null;
    color: string | null;
}

export interface AnimeMedia {
    id: number;
    title: MediaTitle;
    coverImage: MediaCoverImage;
    averageScore: number | null;
    genres: string[];
    description: string | null;
    episodes: number | null;
    chapters: number | null;
    status: string | null;
}

export type MediaType = 'ANIME' | 'MANGA';
