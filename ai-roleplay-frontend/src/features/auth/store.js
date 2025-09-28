import { create } from 'zustand';

const initialState = {
  user: null,
  accessToken: '',
};

export const useAuthStore = create((set, get) => ({
  ...initialState,
  isAuthenticated: () => Boolean(get().accessToken),
  setSession: ({ user, token }) => {
    try {
      if (token) localStorage.setItem('access_token', token);
    } catch {}
    set({ user, accessToken: token || '' });
  },
  clearSession: () => {
    try {
      localStorage.removeItem('access_token');
    } catch {}
    set({ ...initialState });
  },
  hydrateFromStorage: () => {
    let token = '';
    try {
      token = localStorage.getItem('access_token') || '';
    } catch {}
    if (token) set({ accessToken: token });
  },
}));


