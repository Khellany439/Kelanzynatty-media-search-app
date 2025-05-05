import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface MediaItem {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  provider: string;
}

interface MediaState {
  items: MediaItem[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: MediaState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchMedia = createAsyncThunk(
  'media/fetchMedia',
  async (query: string) => {
    const response = await axios.get(`https://api.openverse.org/v1/images?q=${query}`);
    return response.data.results;
  }
);

const mediaSlice = createSlice({
  name: 'media',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMedia.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchMedia.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchMedia.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch media';
      });
  },
});

export default mediaSlice.reducer;
