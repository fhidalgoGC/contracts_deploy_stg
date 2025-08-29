import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User, Tokens } from '../types/auth';

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  tokens: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ user: User; tokens: Tokens }>) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.tokens = action.payload.tokens;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.tokens = null;
    },
    updateTokens: (state, action: PayloadAction<Tokens>) => {
      state.tokens = action.payload;
    },
  },
});

export const { login, logout, updateTokens } = authSlice.actions;
export default authSlice.reducer;
