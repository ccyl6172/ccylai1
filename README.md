# BPM Frontend Codex Patch

這包不是完整專案，而是給 Codex 套用的前端 patch。

## 包含

- `frontend/src/services/bpmApi.js`：集中管理 `/api/init`、`/api/sync`，避免前端誤判已同步到 SQL。
- `frontend/src/components/BackendDiagnostics.jsx`：前端診斷面板，可直接測後端連線與同步測試資料。
- `frontend/.env.example`：後端 API port 設定範例。
- `CODEX_TASK.md`：可直接貼給 Codex 的整合任務。

## 後端目前建議 API

```env
VITE_API_BASE_URL=http://localhost:7000/api
```

## 核心修正

原本前端容易把「後端成功」與「本機暫存」混在同一個訊息中。這版改成明確狀態，方便測試 MetadataMaterializer 是否真的寫入 SQL Server。
