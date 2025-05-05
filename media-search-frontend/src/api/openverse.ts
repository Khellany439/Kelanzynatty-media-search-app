import axios from 'axios';

const BASE_URL = 'https://api.openverse.org/v1/';

export type MediaType = 'image' | 'audio';

export interface OpenverseMedia {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  provider: string;
  source: string;
  license: string;
  license_url: string;
  type: MediaType;
}

/**
 * Search the Openverse API for public domain media.
 * @param query The search term
 * @param mediaType 'image' or 'audio'
 * @param page Optional page number (default 1)
 * @returns An array of OpenverseMedia
 */
export const searchOpenverse = async (
  query: string,
  mediaType: MediaType = 'image',
  page: number = 1
): Promise<OpenverseMedia[]> => {
  try {
    const response = await axios.get(`${BASE_URL}${mediaType}/`, {
      params: {
        q: query,
        page,
        page_size: 20,
      },
    });

    const results = response.data.results;

    return results.map((item: any) => ({
      id: item.id,
      title: item.title || 'Untitled',
      url: item.url,
      thumbnail: item.thumbnail || item.url,
      provider: item.provider,
      source: item.source,
      license: item.license,
      license_url: item.license_url,
      type: mediaType,
    }));
  } catch (error: any) {
    console.error('Openverse API error:', error.message);
    throw new Error('Failed to fetch media from Openverse');
  }
};
