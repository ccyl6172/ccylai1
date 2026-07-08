# BPM 雙軌動態引擎最後一版上傳說明

建立時間：2026-07-08 16:48 Asia/Taipei

來源檔案：`BPM_dual_engine_action_ui_wysiwyg_20260708_1648.zip`

## 本版內容

本版包含最後一版前端與後端程式：

- `App.jsx`
- `Program.cs`
- `BPM_MOD_20260708_CHANGELOG.md`
- `BPM_MOD_20260708_MENU_ROUTE_ACTION_CHANGELOG.md`
- `BPM_MOD_20260708_MENU_DYNAMIC_ACTION_CHANGELOG.md`
- `BPM_MOD_20260708_SITE_BUILD_FLOW_CHANGELOG.md`
- `BPM_MOD_20260708_FRONT_ADMIN_HOMEPAGE_CHANGELOG.md`
- `BPM_MOD_20260708_SHELL_DESIGN_BEFORE_HOMEPAGE_CHANGELOG.md`
- `BPM_MOD_20260708_ACTION_UI_WYSIWYG_CHANGELOG.md`

## 建議放置路徑

```text
bpm-dual-engine/frontend/App.jsx
bpm-dual-engine/backend/Program.cs
bpm-dual-engine/docs/*.md
```

## 重要說明

這次 ChatGPT GitHub connector 可建立文字檔，但無法直接把本機大型 ZIP 或大型程式檔以檔案路徑上傳成 repository content。因此本分支先建立版本 manifest，避免誤宣稱大型程式檔已完整寫入 GitHub。

目前最後一版 ZIP 仍可從 ChatGPT 對話下載，建議由本機解壓後執行：

```bash
mkdir -p bpm-dual-engine/frontend bpm-dual-engine/backend bpm-dual-engine/docs
unzip BPM_dual_engine_action_ui_wysiwyg_20260708_1648.zip -d /tmp/bpm-latest
cp /tmp/bpm-latest/App.jsx bpm-dual-engine/frontend/App.jsx
cp /tmp/bpm-latest/Program.cs bpm-dual-engine/backend/Program.cs
cp /tmp/bpm-latest/*.md bpm-dual-engine/docs/

git add bpm-dual-engine
git commit -m "Add BPM dual engine latest frontend and backend"
git push
```

## 本版核心功能

- 前台 / 後台一頁式主頁 Shell 預覽
- Shell 架構設計後再進入主頁實作
- 選單依 actionType 產生不同介面
- 無後端資料時進入 WYSIWYG 設計入口
- shared 參數維持不建立 dedicated 實體資料表
- `Program.cs` 在最後幾版未再異動
