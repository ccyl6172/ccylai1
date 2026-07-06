# Codex Task: Frontend backend-sync diagnostics

## Goal
Apply this patch to the current React frontend so the UI can clearly distinguish these states:

1. Successfully synced to SQL Server backend.
2. Backend sync failed, but data was saved to localStorage.
3. Backend is unreachable.
4. Backend is reachable but currently returns empty data.

Keep the original App.jsx UI. Do not replace it with a simplified page.

## Files added

- `frontend/src/services/bpmApi.js`
- `frontend/src/components/BackendDiagnostics.jsx`
- `frontend/.env.example`

## API base URL
Create or update `frontend/.env.local`:

```env
VITE_API_BASE_URL=http://localhost:7000/api
```

## App.jsx integration
Find the original `const API = { ... }` block and route `getInitData` and `syncFullState` through `src/services/bpmApi.js`.

Suggested import:

```js
import { getInitData, syncFullState, API_BASE_URL } from './services/bpmApi';
```

Suggested API block:

```js
const API = {
  getInitData: async () => {
    const result = await getInitData();
    console.log('[InitData]', result);
    return result.data;
  },
  syncFullState: async (fullState) => {
    const result = await syncFullState(fullState, { allowLocalFallback: false });
    console.log('[SyncFullState]', result);
    if (!result.success) throw new Error(result.error || 'sync failed');
    return result;
  },
  deleteParamCategory: async (...args) => {
    // Keep the original deleteParamCategory implementation.
  }
};
```

## Add diagnostics panel
Import:

```js
import BackendDiagnostics from './components/BackendDiagnostics';
```

Render it somewhere in the main page:

```jsx
<BackendDiagnostics getCurrentState={() => fullState} />
```

If there is no `fullState` variable, pass the current state shape instead:

```jsx
<BackendDiagnostics getCurrentState={() => ({ params, systemSettings })} />
```

## Acceptance test
Backend:

```powershell
cd D:\ai_study\AI_VSCODE\bpm_enterprise_refactor\backend\BpmBackendApi
dotnet run --urls "http://localhost:7000"
```

Frontend:

```powershell
cd D:\ai_study\AI_VSCODE\bpm_enterprise_refactor\frontend
npm run dev
```

Click `同步測試 Metadata`. Backend terminal should show:

```txt
>>> Before MaterializeAsync
>>> MetadataMaterializer.MaterializeAsync 已被呼叫
>>> JSON Length = ...
>>> After MaterializeAsync
```

SQL Server `test4` should show at least:

- App_SysConfig
- App_Params
- App_Params_val
- Sys_Field_Mappings

Do not keep vague UI messages such as `已同步到後端/本機暫存`. Use explicit messages from `bpmApi.js`.
