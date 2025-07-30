import { configureStore } from "@reduxjs/toolkit";
import UserReducer from "./Features/UserSlice"; 
import postReducer from './Features/PostSlice';
import eventReducer from './Features/eventSlice';
import reminderReducer from './Features/reminderSlice';
import recommendationReducer from './Features/recommendationsSlice';
import trendingReducer      from './Features/trendingSlice';

// Create and export the store
export const store = configureStore({
    reducer: {
        user: UserReducer, 
        post: postReducer,
        event: eventReducer,
        reminder: reminderReducer,
        recommendations: recommendationReducer,
        trending:        trendingReducer,

    },
});
