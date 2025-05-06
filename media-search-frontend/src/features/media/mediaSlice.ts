import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// Type definitions
interface MediaItem {
  id: string;
  title: string;
  creator?: string;
  url: string;
  thumbnail: string;
  license: string;
  license_version?: string;
  tags: string[];
  provider: string;
  created_at: string;
}

interface MediaState {
  items: MediaItem[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  searchMeta: {
    query: string;
    page: number;
    hasMore: boolean;
  };
}

interface SearchParams {
  query: string;
  mediaType?: 'image' | 'audio' | 'video';
  license?: string;
  page?: number;
}

const initialState: MediaState = {
  items: [],
  status: 'idle',
  error: null,
  searchMeta: {
    query: '',
    page: 1,
    hasMore: false
  }
};

// Async thunk with proper typing and error handling
export const fetchMedia = createAsyncThunk<MediaItem[], SearchParams, { rejectValue: string }>(
  'media/fetchMedia',
  async (searchParams, { rejectWithValue }) => {
    try {
      const { query, mediaType = 'image', license, page = 1 } = searchParams;
      
      const response = await axios.get('https://api.openverse.org/v1/', {
        params: {
          q: query,
          license_type: license || 'commercial,modification',
          page: page.toString(),
          format: 'json',
          type: mediaType
        }
      });

      if (!response.data.results) {
        throw new Error('Invalid API response structure');
      }

      return response.data.results.map((item: any) => ({
        id: item.id,
        title: item.title,
        creator: item.creator,
        url: item.url,
        thumbnail: item.thumbnail || '/placeholder.jpg',
        license: item.license,
        license_version: item.license_version,
        tags: item.tags?.map((t: any) => t.name) || [],
        provider: item.provider,
        created_at: item.created_on
      }));
    } catch (err) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(err.response?.data?.detail || 'Network error');
      }
      return rejectWithValue((err as Error).message || 'Failed to fetch media');
    }
  }
);

const mediaSlice = createSlice({
  name: 'media',
  initialState,
  reducers: {
    clearMedia: (state) => {
      state.items = [];
      state.searchMeta = initialState.searchMeta;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMedia.pending, (state, action) => {
        state.status = 'loading';
        state.error = null;
        
        // Reset search meta if it's a new query
        if (action.meta.arg.query !== state.searchMeta.query) {
          state.searchMeta = {
            query: action.meta.arg.query,
            page: 1,
            hasMore: false
          };
          state.items = [];
        }
      })
      .addCase(fetchMedia.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = [...state.items, ...action.payload];
        state.searchMeta.page += 1;
        state.searchMeta.hasMore = action.payload.length > 0;
      })
      .addCase(fetchMedia.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Unknown error occurred';
      });
  }
});

export const { clearMedia } = mediaSlice.actions;
export default mediaSlice.reducer;