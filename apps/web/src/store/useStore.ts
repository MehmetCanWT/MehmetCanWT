import { create } from 'zustand';

interface AppState {
  isAuth: boolean;
  setAuth: (val: boolean) => void;
  logout: () => void;
}

export const useStore = create<AppState>((set) => ({
  isAuth: !!localStorage.getItem('mehmetcanwt_admin_auth'),
  setAuth: (val) => {
    if (val) {
      localStorage.setItem('mehmetcanwt_admin_auth', 'true');
    } else {
      localStorage.removeItem('mehmetcanwt_admin_auth');
    }
    set({ isAuth: val });
  },
  logout: () => {
    localStorage.removeItem('mehmetcanwt_admin_auth');
    fetch('/api/admin/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
    set({ isAuth: false });
  },
}));