import { create } from 'zustand';

interface AppState {
  isAuth: boolean;
  token: string | null;
  setAuth: (val: boolean, token?: string | null) => void;
  logout: () => void;
}

export const useStore = create<AppState>((set) => ({
  isAuth: !!localStorage.getItem('mehmetcanwt_admin_token'),
  token: localStorage.getItem('mehmetcanwt_admin_token'),
  setAuth: (val, token = null) => {
    if (val && token) {
      localStorage.setItem('mehmetcanwt_admin_token', token);
    } else {
      localStorage.removeItem('mehmetcanwt_admin_token');
    }
    set({ isAuth: val, token: val ? token : null });
  },
  logout: () => {
    localStorage.removeItem('mehmetcanwt_admin_token');
    set({ isAuth: false, token: null });
  },
}));