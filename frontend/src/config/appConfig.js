export const CONFIG = {
  USE_REAL_BACKEND: true,
  REAL_API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:7000/api',
  ASK_SEED_INIT: true
};

export const LOCAL_STORAGE_KEY = 'BPM_REFACTOR_STATE_V1';
