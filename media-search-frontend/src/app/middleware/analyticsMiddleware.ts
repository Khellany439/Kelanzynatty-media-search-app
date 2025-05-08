import { Middleware } from '@reduxjs/toolkit';

const analyticsMiddleware: Middleware = (store) => (next) => (action) => {
  if (action.type.endsWith('/fulfilled')) {
    console.log('Tracking action:', action.type);
    // Implement actual analytics tracking
  }
  return next(action);
};

export default analyticsMiddleware;