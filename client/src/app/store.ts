import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authSlice from '../features/auth/slices/authSlice';
import { authApi, identityApi } from '../features/auth/services/authApi';
import pageStateSlice from '../store/slices/pageStateSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    pageState: pageStateSlice,
    [authApi.reducerPath]: authApi.reducer,
    [identityApi.reducerPath]: identityApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, identityApi.middleware),
});

// Middleware para persistir estado automáticamente
store.subscribe(() => {
  const state = store.getState();
  // Guardar solo el estado de las páginas en localStorage
  localStorage.setItem('pageState', JSON.stringify(state.pageState));
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
