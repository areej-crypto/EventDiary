import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk to create an event
export const createEvent = createAsyncThunk(
  'event/createEvent',
  async (formData, thunkAPI) => {
    try {
      const response = await axios.post(
        'http://127.0.0.1:8080/events',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data.event;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || error.message
      );
    }
  }
);

// Async thunk to fetch events
export const fetchEvents = createAsyncThunk(
  'event/fetchEvents',
  async (_, thunkAPI) => {
    try {
      const response = await axios.get('http://127.0.0.1:8080/events');
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || error.message
      );
    }
  }
);

const eventSlice = createSlice({
  name: 'event',
  initialState: {
    events: [],
    isLoading: false,
    isError: false,
    errorMessage: '',
    isSuccess: false,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      // createEvent
      .addCase(createEvent.pending, state => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = '';
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.events.push(action.payload);
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload || 'Error creating event';
      })

      // fetchEvents
      .addCase(fetchEvents.pending, state => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = '';
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.events = action.payload;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload || 'Error fetching events';
      });
  },
});

export default eventSlice.reducer;
