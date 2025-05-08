import { Middleware } from '@reduxjs/toolkit';
import { logout } from '../../features/auth/authSlice';

const apiErrorMiddleware: Middleware = (store) => (next) => (action) => {
  if (action.type.endsWith('/rejected')) {
    const error = action.payload;
    if (error?.status === 401) {
      store.dispatch(logout());
    }
  }
  return next(action);
};

export default apiErrorMiddleware;