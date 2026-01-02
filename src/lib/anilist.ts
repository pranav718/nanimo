import { AnimeMedia, MediaType } from '@/types';

const ANILIST_API = 'https://graphql.anilist.co';

const TRENDING_QUERY = `
  query TrendingMedia($page: Int, $perPage: Int, $type: MediaType) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        currentPage
        lastPage
        hasNextPage
      }
      media(type: $type, sort: TRENDING_DESC, isAdult: false) {
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
        averageScore
        genres
        description(asHtml: false)
        episodes
        chapters
        status
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

interface TrendingResponse {
  data: {
    Page: {
      pageInfo: PageInfo;
      media: AnimeMedia[];
    };
  };
}

/**
 * Fetch trending anime or manga from AniList
 * 
 * @param type - 'ANIME' or 'MANGA'
 * @param page - Page number (1-indexed)
 * @param perPage - Items per page (max 50)
 */
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
      query: TRENDING_QUERY,
      variables: { page, perPage, type },
    }),
  });

  if (!response.ok) {
    throw new Error(`AniList API error: ${response.status}`);
  }

  const json: TrendingResponse = await response.json();
  return {
    media: json.data.Page.media,
    pageInfo: json.data.Page.pageInfo,
  };
}

export async function fetchAllTrendingMedia(
  type: MediaType = 'ANIME',
  totalPages: number = 10
): Promise<AnimeMedia[]> {
  const pagePromises = Array.from({ length: totalPages }, (_, i) =>
    fetchTrendingMedia(type, i + 1, 50)
  );

  const results = await Promise.all(pagePromises);
  return results.flatMap((r) => r.media);
}
