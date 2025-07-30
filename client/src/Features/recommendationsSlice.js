import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchRecommendations = createAsyncThunk(
  'recommendations/fetch',
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`http://127.0.0.1:8080/api/recommendations/${userId}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const slice = createSlice({
  name: 'recommendations',
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: builder => builder
    .addCase(fetchRecommendations.pending, state => {
      state.loading = true; state.error = null;
    })
    .addCase(fetchRecommendations.fulfilled, (state, { payload }) => {
      state.loading = false; state.items = payload;
    })
    .addCase(fetchRecommendations.rejected, (state, { payload }) => {
      state.loading = false; state.error = payload;
    })
});

export default slice.reducer;
