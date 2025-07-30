import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk to fetch reminders for a user
export const fetchReminders = createAsyncThunk(
  'reminder/fetchReminders',
  async (userId, thunkAPI) => {
    try {
      const response = await axios.get(`http://127.0.0.1:8080/reminders?userId=${userId}`);
      return response.data; // an array of reminders
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

// Async thunk to save a reminder to the backend
// 2) Save a reminder _and_ log the interaction
export const saveReminder = createAsyncThunk(
  'reminder/saveReminder',
  async (reminderData, thunkAPI) => {
    try {
      // A) write to your Reminder collection
      const { data } = await axios.post(
        'http://127.0.0.1:8080/reminders',
        reminderData
      );

      // B) also write to your Interaction collection
      await axios.post(
        'http://127.0.0.1:8080/api/interactions',
        {
          userId: reminderData.userId,
          eventId: reminderData.eventId,
          interactionType: 'remind'
        }
      );
 // return the saved Reminder
      return data.reminder;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);    

// Async thunk to remove a reminder from the backend
export const deleteReminder = createAsyncThunk(
  'reminder/deleteReminder',
  async (reminderId, thunkAPI) => {
    try {
      await axios.delete(`http://127.0.0.1:8080/reminders/${reminderId}`);
      return reminderId;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  reminders: [],
  isLoading: false,
  error: null,
};

const reminderSlice = createSlice({
  name: 'reminder',
  initialState,
  reducers: {
  },
  extraReducers: (builder) => {
    builder
      // Fetch reminders
      .addCase(fetchReminders.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchReminders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reminders = action.payload;
      })
      .addCase(fetchReminders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Save reminder
      .addCase(saveReminder.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(saveReminder.fulfilled, (state, action) => {
        state.isLoading = false;
        // Add the reminder if it isn’t already present
        if (!state.reminders.find((r) => r._id === action.payload._id)) {
          state.reminders.push(action.payload);
        }
      })
      .addCase(saveReminder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete reminder
      .addCase(deleteReminder.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteReminder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reminders = state.reminders.filter(r => r._id !== action.payload);
      })
      .addCase(deleteReminder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default reminderSlice.reducer;
