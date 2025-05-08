/**
 * @module App
 * @description 
 * Root application component that handles:
 * - Core application routing and navigation
 * - Authentication gatekeeping for protected routes
 * - Session persistence via Redux integration
 * - Route fallbacks and error handling
 * 
 * @remarks
 * This component implements a declarative routing system with the following characteristics:
 * - Public routes (login/register) accessible to all users
 * - Protected routes (search/results) requiring authentication
 * - Automatic session-based redirects
 * - 404 handling via wildcard redirect
 * 
 * @dependencies
 * - react-router-dom: Handles client-side routing
 * - react-redux: Manages authentication state
 * - Custom auth components: Login, Register
 * - Page components: SearchPage, SearchResults
 * 
 * @stateManagement
 * - Reads authentication state from Redux store
 * - Does not dispatch actions (presentational component)
 * 
 * @author Kelanzy
 * @created 2023-11-20
 * @lastModified 2023-11-20
 * @version 1.0.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import Register from '../src/components/Auth/Register';
import SearchPage from '../src/pages/SearchPage';
import SearchResults from './pages/SearchResults';
import { useSelector } from 'react-redux';
import { RootState } from '../src/app/store';

// -----------------------------------------------------------------------------
// Component Definition
// -----------------------------------------------------------------------------

/**
 * @function App
 * @returns {React.FC} Functional component representing application root
 * 
 * @behavior
 * - Mounts router context for entire application
 * - Conditionally renders routes based on auth state
 * - Implements route protection via redirects
 * 
 * @performance
 * - Optimized single render cycle for route resolution
 * - Memoization not required (no internal state)
 * 
 * @security
 * - Prevents unauthorized access to protected routes
 * - No sensitive data handling (delegated to auth components)
 * 
 * @testability
 * - Easily mockable Redux store for testing different auth states
 * - Isolated route testing via memory router
 */
const App: React.FC = () => {
  /**
   * @selector authState
   * @description Retrieves authentication status from Redux store
   * 
   * @returns {boolean} Current authentication state
   * 
   * @note
   * - Subscribes to store updates automatically
   * - Triggers re-render on auth state changes
   */
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  // ---------------------------------------------------------------------------
  // Route Configuration
  // ---------------------------------------------------------------------------

  return (
    <Router>
      <Routes>
        {/**
         * @route Root Path
         * @path /
         * @behavior
         * - Authentication-gated entry point
         * - Redirects to login when unauthenticated
         * - Loads SearchPage when authenticated
         */}
        <Route 
          path="/" 
          element={isAuthenticated ? <SearchPage /> : <Navigate to="/login" />} 
        />
        
        {/**
         * @route Authentication
         * @path /login
         * @unprotected
         * @component Login
         */}
        <Route path="/login" element={<Login />} />

        {/**
         * @route Registration
         * @path /register
         * @unprotected
         * @component Register
         */}
        <Route path="/register" element={<Register />} />
        
        {/**
         * @route Search Results
         * @path /results
         * @protected
         * @behavior
         * - Requires valid authentication session
         * - Redirects to login if unauthorized
         */}
        <Route
          path="/results"
          element={isAuthenticated ? <SearchResults /> : <Navigate to="/login" />}
        />
        
        {/**
         * @route Catch-All
         * @path *
         * @behavior
         * - Handles 404 scenarios
         * - Redirects to root path
         * @security Prevents access to undefined routes
         */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;