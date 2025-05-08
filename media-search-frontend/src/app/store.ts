/**
 * @module app/store
 * @description 
 * Redux store configuration with:
 * - Combined reducers
 * - Middleware customization
 * - Development tooling
 * - Type-safe state management
 * 
 * @features
 * - Redux Toolkit configuration
 * - DevTools integration
 * - Custom middleware
 * - TypeScript support
 * 
 * @structure
 * - auth: Authentication state
 * - media: Media search state
 */

import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from '../features/auth/authSlice';
import mediaReducer from '../features/media/mediaSlice';
import apiErrorMiddleware from './middleware/apiErrorMiddleware';
import analyticsMiddleware from './middleware/analyticsMiddleware';

/**
 * @constant persistConfig
 * @description Configuration for redux-persist
 * 
 * @property {string} key - Root key for persistence
 * @property {Storage} storage - Storage engine (localStorage)
 * @property {string[]} whitelist - Reducers to persist
 */
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'], // Only persist auth state
};

/**
 * @constant persistedAuthReducer
 * @description Auth reducer with persistence
 */
const persistedAuthReducer = persistReducer(persistConfig, authReducer);

/**
 * @function configureAppStore
 * @description Configures Redux store with middleware and enhancers
 * 
 * @returns {Object} Configured store and persistor
 */
export const configureAppStore = () => {
  const store = configureStore({
    reducer: {
      auth: persistedAuthReducer,
      media: mediaReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          // Ignore these paths in the state
          ignoredPaths: ['auth.user'], // For potential non-serializable user data
          ignoredActions: ['persist/PERSIST'], // For redux-persist actions
        },
      }).concat([
        apiErrorMiddleware,
        analyticsMiddleware,
      ]),
    devTools: process.env.NODE_ENV !== 'production',
  });

  const persistor = persistStore(store);

  // Enable hot module replacement for reducers
  if (process.env.NODE_ENV === 'development' && module.hot) {
    module.hot.accept('../features/auth/authSlice', () => {
      store.replaceReducer(persistedAuthReducer);
    });
    module.hot.accept('../features/media/mediaSlice', () => {
      store.replaceReducer(mediaReducer);
    });
  }

  return { store, persistor };
};

const { store, persistor } = configureAppStore();

// Type definitions
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export { store, persistor };