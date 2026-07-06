import { LOCAL_STORAGE_KEY } from '../config/appConfig.js';

export function saveLocalState(state) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
}

export function loadLocalState() {
  const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    return null;
  }
}

export function clearLocalState() {
  localStorage.removeItem(LOCAL_STORAGE_KEY);
}
