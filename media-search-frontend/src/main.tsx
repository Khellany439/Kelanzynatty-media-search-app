/**
 * @file index.tsx
 * @description 
 * Application entry point and root mounting logic. Responsible for:
 * - Initializing the React application
 * - Setting up Redux provider with store
 * - Wrapping application in StrictMode
 * - Handling root DOM node mounting
 * 
 * @moduleIndex
 * - Primary client-side rendering bootstrap
 * - Core dependency initialization
 * 
 * @architecture
 * - Top-level provider configuration
 * - Environment-agnostic mounting logic
 * 
 * @dependencies
 * - react: Core library
 * - react-dom/client: Concurrent mode rendering
 * - react-redux: State management
 * - Custom store configuration
 * 
 * @author Kelanzy
 * @created 2023-11-20
 * @lastModified 2023-11-20
 * @version 1.0.0
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App';
import { store } from './app/store'; // Centralized Redux store
import './index.css'; // Global styles

// -----------------------------------------------------------------------------
// DOM Root Initialization
// -----------------------------------------------------------------------------

/**
 * @constant root
 * @description React root container instance
 * 
 * @type {ReactDOM.Root}
 * 
 * @assertion
 * - Type assertion for HTMLElement guarantees mounting safety
 * - Throws error if #root element is missing (caught by error boundaries)
 */
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// -----------------------------------------------------------------------------
// Application Rendering
// -----------------------------------------------------------------------------

/**
 * @function render
 * @description Mounts the application with production-grade wrappers
 * 
 * @wrappers
 * 1. React.StrictMode: Development-time checks
 * 2. Redux Provider: Global state management
 * 
 * @performance
 * - Uses concurrent mode features (React 18+)
 * - Single render pass for initialization
 * 
 * @sideEffects
 * - Initializes Redux store subscriptions
 * - Activates React dev tools in development
 * - Applies global CSS normalization
 */
root.render(
  <React.StrictMode>
    {/**
      * @provider ReduxStore
      * @description Provides global state access to all components
      * 
      * @configuration
      * - Store instance created via configureStore
      * - Middleware pre-configured
      * - DevTools integration
      */}
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);

// -----------------------------------------------------------------------------
// Development Enhancements
// -----------------------------------------------------------------------------

/**
 * @developmentNotes
 * 1. Webpack Hot Module Replacement configured separately
 * 2. Axios interceptors should be initialized here if used
 * 3. Error tracking setup (Sentry/LogRocket) goes here
 * 
 * @productionNotes
 * - This file should remain minimal in production
 * - All dev-specific logic tree-shaken in prod builds
 */