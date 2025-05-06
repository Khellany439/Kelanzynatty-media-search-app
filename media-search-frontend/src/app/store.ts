import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import mediaReducer from '../features/media/mediaSlice';

// Create the store with type annotations
const store = configureStore({
  reducer: {
    auth: authReducer,
    media: mediaReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Export the configured store instance
export { store };

// Type definitions
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;