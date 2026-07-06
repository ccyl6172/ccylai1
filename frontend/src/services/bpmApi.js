import { CONFIG } from '../config/appConfig.js';
import { saveLocalState } from './localStateStore.js';

export const API_BASE_URL = CONFIG.REAL_API_BASE_URL;

async function parseJsonResponse(response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Backend returned invalid JSON: ${text.substring(0, 300)}`);
  }
}

async function requestJson(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {})
    },
    ...options
  });

  const data = await parseJsonResponse(response);

  if (!response.ok || data?.success === false) {
    throw new Error(data?.error || data?.message || `HTTP ${response.status}`);
  }

  return data;
}

export async function checkBackendHealth() {
  const startedAt = performance.now();

  try {
    const data = await requestJson('/init', { method: 'GET', cache: 'no-store' });
    return {
      ok: true,
      status: 200,
      elapsedMs: Math.round(performance.now() - startedAt),
      data,
      message: '後端連線正常'
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      elapsedMs: Math.round(performance.now() - startedAt),
      data: null,
      error: error.message,
      message: `後端連線失敗：${error.message}`
    };
  }
}

export async function getInitData({ fallbackToLocalStorage = false } = {}) {
  const health = await checkBackendHealth();

  if (health.ok && health.data && Object.keys(health.data).length > 0) {
    return {
      success: true,
      source: 'backend',
      data: health.data,
      message: '已從 SQL Server 後端載入資料'
    };
  }

  return {
    success: true,
    source: health.ok ? 'backend-empty' : 'empty',
    data: null,
    backendHealth: health,
    message: health.ok ? '後端已連線，但目前沒有完整 metadata' : health.message
  };
}

export async function syncFullState(fullState, { allowLocalFallback = false } = {}) {
  try {
    const data = await requestJson('/sync', {
      method: 'POST',
      body: JSON.stringify(fullState)
    });

    saveLocalState(fullState);

    return {
      success: true,
      persistedTo: 'backend',
      data,
      message: '已成功同步到 SQL Server 後端'
    };
  } catch (error) {
    if (allowLocalFallback) {
      saveLocalState(fullState);
      return {
        success: true,
        persistedTo: 'localStorage',
        error: error.message,
        message: `後端同步失敗，已暫存到 localStorage：${error.message}`
      };
    }

    return {
      success: false,
      persistedTo: 'none',
      error: error.message,
      message: `後端同步失敗，未寫入 localStorage：${error.message}`
    };
  }
}

export const testPayload = {
  params: [
    {
      id: 'CAT-TEST',
      code: 'TEST',
      name: '測試參數',
      type: 'TABLE',
      itemSchemaDef: [
        { fieldKey: 'code', fieldName: '代碼', storageType: 'column', isPrimaryKey: 'true', fieldType: 'text' },
        { fieldKey: 'name', fieldName: '名稱', storageType: 'column', isPrimaryKey: 'false', fieldType: 'text' }
      ],
      items: [
        { id: 'T1', code: 'A001', name: '測試資料' }
      ]
    }
  ],
  systemSettings: {}
};

export const API = {
  getInitData: async () => {
    const result = await getInitData();
    return result.data;
  },
  syncFullState,
  validate: async (state) => requestJson('/validate', {
    method: 'POST',
    body: JSON.stringify(state)
  }),
  canTransition: async (payload) => requestJson('/can-transition', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  deleteParamCategory: async (categoryId, sysKey, isGlobal) => requestJson('/deleteCategory', {
    method: 'POST',
    body: JSON.stringify({ categoryId, sysKey, isGlobal })
  })
};

export const bpmApi = {
  init: API.getInitData,
  sync: syncFullState,
  validate: API.validate,
  canTransition: API.canTransition
};
