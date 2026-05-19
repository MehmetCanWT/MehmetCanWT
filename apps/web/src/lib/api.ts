import { useStore } from '../store/useStore';

const API_BASE = '';

export async function apiFetch(path: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  // If 401, auto-logout
  if (res.status === 401) {
    useStore.getState().logout();
  }

  return res;
}

export async function apiGet(path: string) {
  const res = await apiFetch(path);
  return res.json();
}

export async function apiPost(path: string, body?: any) {
  const res = await apiFetch(path, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}
