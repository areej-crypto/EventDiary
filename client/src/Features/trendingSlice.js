import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchTrending = createAsyncThunk(
   'trending/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get('http://localhost:8080/api/trending-events');
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const slice = createSlice({
  name: 'trending',
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: builder => builder
    .addCase(fetchTrending.pending, state => {
      state.loading = true; state.error = null;
    })
    .addCase(fetchTrending.fulfilled, (state, { payload }) => {
      state.loading = false; state.items = payload;
    })
    .addCase(fetchTrending.rejected, (state, { payload }) => {
      state.loading = false; state.error = payload;
    })
});

export default slice.reducer;
