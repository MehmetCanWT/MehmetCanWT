import { create } from 'zustand';

interface AppState {
  isAuth: boolean;
  setAuth: (val: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  isAuth: localStorage.getItem('mehmetcanwt_admin_auth') === 'true',
  setAuth: (val) => {
    localStorage.setItem('mehmetcanwt_admin_auth', val ? 'true' : 'false');
    set({ isAuth: val });
  },
}));