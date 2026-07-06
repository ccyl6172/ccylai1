const DEFAULT_API_BASE_URL = 'http://localhost:7000/api';
const LOCAL_STORAGE_KEY = 'BpmEnterprise_DualTreeState_v3145';

export const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL)
    ? import.meta.env.VITE_API_BASE_URL
    : DEFAULT_API_BASE_URL;

async function parseJsonResponse(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`後端回傳不是合法 JSON：${text.substring(0, 300)}`);
  }
}

export async function checkBackendHealth() {
  const startedAt = performance.now();
  try {
    const response = await fetch(`${API_BASE_URL}/init`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store'
    });

    const elapsedMs = Math.round(performance.now() - startedAt);
    const data = await parseJsonResponse(response);

    return {
      ok: response.ok,
      status: response.status,
      elapsedMs,
      data,
      message: response.ok ? '後端連線正常' : `後端回應錯誤：HTTP ${response.status}`
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

export async function getInitData({ fallbackToLocalStorage = true } = {}) {
  const health = await checkBackendHealth();

  if (health.ok && health.data && Object.keys(health.data).length > 0) {
    return {
      success: true,
      source: 'backend',
      data: health.data,
      message: '已從 SQL Server 後端載入資料'
    };
  }

  if (fallbackToLocalStorage) {
    const localRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (localRaw) {
      try {
        return {
          success: true,
          source: 'localStorage',
          data: JSON.parse(localRaw),
          backendHealth: health,
          message: '後端目前沒有資料，已改從 localStorage 載入'
        };
      } catch {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }
  }

  return {
    success: true,
    source: health.ok ? 'backend-empty' : 'empty',
    data: null,
    backendHealth: health,
    message: health.ok ? '後端已連線，但 App_SysConfig 目前沒有資料' : health.message
  };
}

export async function syncFullState(fullState, { allowLocalFallback = false } = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(fullState)
    });

    const data = await parseJsonResponse(response);

    if (!response.ok || data?.success === false) {
      const errorMessage = data?.error || `HTTP ${response.status}`;
      throw new Error(errorMessage);
    }

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(fullState));

    return {
      success: true,
      persistedTo: 'backend',
      data,
      message: '已成功同步到 SQL Server 後端'
    };
  } catch (error) {
    if (allowLocalFallback) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(fullState));
      return {
        success: true,
        persistedTo: 'localStorage',
        error: error.message,
        message: `後端同步失敗，已暫存到瀏覽器 localStorage：${error.message}`
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
