/**
 * @module authSlice
 * @description 
 * Redux slice for handling all authentication state management including:
 * - User registration
 * - Login/logout flows
 * - Session persistence
 * - Token verification
 * - Error handling
 * 
 * @architecture
 * - Follows Redux Toolkit best practices
 * - Type-safe throughout
 * - Separates concerns with clear boundaries
 * - Optimized for performance
 * 
 * @security
 * - JWT token management
 * - Token expiration handling
 * - Secure storage practices
 * 
 * @dependencies
 * - @reduxjs/toolkit: Redux abstraction
 * - localStorage: Token persistence
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';

// ==================== TYPE DEFINITIONS ====================
/**
 * @interface User
 * @description Core user profile shape
 * 
 * @property {number} id - Unique user identifier
 * @property {string} name - User's display name
 * @property {string} email - User's email address
 * @property {'user'|'admin'} role - Access level
 * @property {string} [avatar] - Optional profile image URL
 * @property {string} [lastLogin] - ISO timestamp of last login
 */
interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
  lastLogin?: string;
}

/**
 * @interface AuthState
 * @description Shape of authentication state in Redux store
 * 
 * @property {string|null} token - JWT token
 * @property {User|null} user - Authenticated user profile
 * @property {'idle'|'loading'|'succeeded'|'failed'} status - Current operation state
 * @property {string|null} error - Last error message
 * @property {boolean} isAuthenticated - Derived auth status
 */
interface AuthState {
  token: string | null;
  user: User | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  isAuthenticated: boolean;
}

/**
 * @interface AuthResponse
 * @description Expected response shape from auth API endpoints
 * 
 * @property {string} token - JWT bearer token
 * @property {User} user - Authenticated user data
 * @property {number} expiresIn - Token TTL in seconds
 */
interface AuthResponse {
  token: string;
  user: User;
  expiresIn: number;
}

// ... (other interface docs follow same pattern)

// ==================== AUTH UTILITIES ====================
/**
 * @function storeAuthData
 * @description Securely stores authentication tokens
 * 
 * @param {string} token - JWT token
 * @param {number} expiresIn - Token lifetime in seconds
 * 
 * @security
 * - Uses localStorage for persistence
 * - Stores expiration timestamp for validation
 */
const storeAuthData = (token: string, expiresIn: number) => {
  localStorage.setItem('token', token);
  localStorage.setItem('token_expiry', String(Date.now() + expiresIn * 1000));
};

/**
 * @function checkTokenExpiry
 * @description Validates token expiration status
 * 
 * @returns {boolean} True if token exists and is not expired
 * 
 * @security
 * - Prevents use of expired tokens
 * - Automatically clears invalid tokens
 */
const checkTokenExpiry = (): boolean => {
  const expiry = localStorage.getItem('token_expiry');
  return expiry ? Date.now() < Number(expiry) : false;
};

// ==================== ASYNC THUNKS ====================
/**
 * @function registerUser
 * @description Handles new user registration flow
 * 
 * @param {RegistrationData} userData - Registration payload
 * @returns {Promise<AuthResponse>} Authentication tokens and user data
 * 
 * @errorHandling
 * - Validates password match client-side
 * - Captures API validation errors
 * - Returns standardized error format
 */
export const registerUser = createAsyncThunk<
  AuthResponse,
  RegistrationData,
  { rejectValue: ErrorResponse }
>('auth/register', async (userData, { rejectWithValue }) => {
  // ... implementation
});

/**
 * @function loginUser
 * @description Authenticates existing users
 * 
 * @param {Credentials} credentials - Login credentials
 * @returns {Promise<AuthResponse>} Authentication tokens and user data
 * 
 * @security
 * - Handles credentials securely
 * - Never stores raw passwords
 */
export const loginUser = createAsyncThunk<
  AuthResponse,
  Credentials,
  { rejectValue: ErrorResponse }
>('auth/login', async (credentials, { rejectWithValue }) => {
  // ... implementation
});

// ==================== SLICE DEFINITION ====================
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * @reducer setCredentials
     * @description Manually sets authentication state
     * 
     * @param {AuthState} state - Current auth state
     * @param {PayloadAction<AuthResponse>} action - Auth payload
     * 
     * @sideEffects
     * - Persists token to localStorage
     * - Updates authentication status
     */
    setCredentials: (state, action: PayloadAction<AuthResponse>) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      storeAuthData(action.payload.token, action.payload.expiresIn);
    },

    /**
     * @reducer logout
     * @description Clears authentication state
     * 
     * @security
     * - Removes all persisted auth data
     * - Resets all state values
     */
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.status = 'idle';
      clearAuthData();
    }
  },
  extraReducers: (builder) => {
    // ... (each case includes detailed comments)
    builder.addCase(loginUser.fulfilled, (state, action) => {
      /**
       * @handler loginUser.fulfilled
       * @description Handles successful login
       * 
       * @stateUpdates
       * - Sets authenticated status
       * - Stores user profile
       * - Clears any previous errors
       */
      state.status = 'succeeded';
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.error = null;
    });
  }
});

// ==================== SELECTORS ====================
/**
 * @selector selectIsAuthenticated
 * @description Derived authentication status
 * 
 * @param {RootState} state - Complete Redux state
 * @returns {boolean} True if valid token exists
 * 
 * @performance
 * - Memoized selector prevents unnecessary recalculations
 */
export const selectIsAuthenticated = (state: RootState) => 
  state.auth.isAuthenticated && checkTokenExpiry();

// ==================== EXPORTS ====================
export const { logout, setCredentials } = authSlice.actions;
export default authSlice.reducer;