import { AnimeMedia, BookstoreGenre, MediaType } from '@/types';

const ANILIST_API = 'https://graphql.anilist.co';

const MEDIA_QUERY = `
  query GetMedia($page: Int, $perPage: Int, $type: MediaType, $genre: String, $sort: [MediaSort]) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        currentPage
        lastPage
        hasNextPage
      }
      media(type: $type, genre: $genre, sort: $sort, isAdult: false) {
        id
        title {
          romaji
          english
          native
        }
        coverImage {
          extraLarge
          large
          medium
          color
        }
        bannerImage
        averageScore
        genres
        description(asHtml: false)
        episodes
        chapters
        status
        format
        seasonYear
        trailer {
          id
          site
          thumbnail
        }
      }
    }
  }
`;

interface PageInfo {
  total: number;
  currentPage: number;
  lastPage: number;
  hasNextPage: boolean;
}

interface MediaResponse {
  data: {
    Page: {
      pageInfo: PageInfo;
      media: AnimeMedia[];
    };
  };
}

export async function fetchMediaByGenre(
  genre: BookstoreGenre,
  type: MediaType = 'MANGA',
  page: number = 1,
  perPage: number = 20
): Promise<AnimeMedia[]> {
  const response = await fetch(ANILIST_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      query: MEDIA_QUERY,
      variables: {
        page,
        perPage,
        type,
        genre,
        sort: ['SCORE_DESC', 'POPULARITY_DESC'],
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`AniList API error: ${response.status}`);
  }

  const json: MediaResponse = await response.json();
  return json.data.Page.media;
}

export async function fetchTrendingMedia(
  type: MediaType = 'ANIME',
  page: number = 1,
  perPage: number = 50
): Promise<{ media: AnimeMedia[]; pageInfo: PageInfo }> {
  const response = await fetch(ANILIST_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      query: MEDIA_QUERY,
      variables: {
        page,
        perPage,
        type,
        sort: ['TRENDING_DESC'],
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`AniList API error: ${response.status}`);
  }

  const json: MediaResponse = await response.json();
  return {
    media: json.data.Page.media,
    pageInfo: json.data.Page.pageInfo,
  };
}

export async function fetchAllTrendingMedia(
  type: MediaType = 'ANIME',
  totalPages: number = 2
): Promise<AnimeMedia[]> {
  const pagePromises = Array.from({ length: totalPages }, (_, i) =>
    fetchTrendingMedia(type, i + 1, 50)
  );

  const results = await Promise.all(pagePromises);
  return results.flatMap((r) => r.media);
}

export async function fetchAllBookstoreGenres(
  type: MediaType = 'MANGA'
): Promise<Record<BookstoreGenre, AnimeMedia[]>> {
  const genres: BookstoreGenre[] = [
    'Romance',
    'Action',
    'Fantasy',
    'Sci-Fi',
    'Mystery',
    'Slice of Life',
  ];

  const results = await Promise.all(
    genres.map(async (genre) => {
      try {
        const media = await fetchMediaByGenre(genre, type, 1, 16);
        return { genre, media };
      } catch {
        return { genre, media: [] };
      }
    })
  );

  return results.reduce((acc, curr) => {
    acc[curr.genre] = curr.media;
    return acc;
  }, {} as Record<BookstoreGenre, AnimeMedia[]>);
}
