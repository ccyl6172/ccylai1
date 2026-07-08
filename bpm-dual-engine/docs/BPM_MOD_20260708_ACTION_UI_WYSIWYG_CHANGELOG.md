# BPM_MOD_20260708_ACTION_UI_WYSIWYG_CHANGELOG

修改時間：2026-07-08 16:48 Asia/Taipei

## 本次修改範圍

本次只修改 `App.jsx`，針對「前台/後台主頁實作根據不同點擊動作產生介面」與「無後端資料時進入 WYSIWYG 所見即所得設計」進行補強。

未修改：

- `Program.cs`
- 後端 API
- View / ST 設計器
- Visual Query Builder
- 既有未觸及程式與備註

## 新增 shared 參數

全部維持 `tableStorageStrategy: 'shared'`，不建立 dedicated 實體資料表。

| 參數代碼 | 用途 |
|---|---|
| `MENU-BACKEND-DATA-MODE` | 定義選單是否需要後端資料，例如 none / required / optional / designerOnly |
| `WYSIWYG-EDITOR-TYPE` | 定義可接入的所見即所得套件 Adapter，例如 builtInBlocks / grapesjs / tiptap / editorjs / tinymce / quill |
| `WYSIWYG-BLOCK-TEMPLATE` | 定義無資料設計時可套用的區塊版型，例如 emptyLanding / dashboardCards / dataTable / formWorkspace / emptyState |
| `WYSIWYG-FALLBACK-MODE` | 定義無資料時如何處理，例如 emptyOnly / openWysiwygDesigner / useMockData / createDataSource |

## 新增選單欄位

在 `menuTreeSchema` 補上：

| 欄位 | 功能 |
|---|---|
| `backendDataMode` | 後端資料需求模式 |
| `designerFallbackMode` | 無資料時的設計處理模式 |
| `wysiwygEditorType` | 要接入的 WYSIWYG 套件 Adapter |
| `wysiwygTemplateCode` | WYSIWYG 預設區塊版型 |

這些欄位使用 `condition: { field: 'actionType', value: [...] }`，可被 JSON 保存，不使用不可序列化的 `conditionFn`。

## 新增 / 調整函式與元件

| 函式 / 元件 | 標註 | 說明 |
|---|---|---|
| `BPM_MOD_20260708_ACTION_UI_WYSIWYG_FIELD_SCHEMA_BLOCK` | 16:48 | 補上選單 actionType 介面產生與 WYSIWYG 設計欄位 |
| `BPM_MOD_20260708_ACTION_UI_WYSIWYG_PARAM_LIST_BLOCK` | 16:48 | 新增 WYSIWYG、後端資料模式與無資料處理 shared 清單 |
| `BPM_MOD_20260708_ACTION_UI_WYSIWYG_DATA_RENDER_PLAN_BLOCK` | 16:48 | 補強 `buildWebsiteMenuDataRenderPlan`，回傳後端資料模式、WYSIWYG 套件與版型 |
| `getWebsiteMenuGeneratedInterfacePlan` | `[M13/H16]` | 依 actionType 決定要產生哪種介面 |
| `WebsiteWysiwygDesignerSurface` | `[M13/H17]` | 無後端資料或頁面尚未產生時的 WYSIWYG 設計入口 |
| `WebsiteGeneratedInterface` | `[M13/H18]` | 依 actionType 產生 route/url/iframe/modal/drawer/API/View/ST/form/pageDesigner 等介面預覽 |
| `WebsiteShellExecutionCard` | `[M13/H06]` | 補上 actionType 產生介面與 WYSIWYG 設計區塊顯示 |

## actionType 介面產生說明

| actionType | 產生介面 |
|---|---|
| `route` | 內部路由頁面骨架 |
| `url` | 外部/內部網址開啟描述 |
| `iframe` | iframe 承載區預覽 |
| `modal` | JavaScript 彈出視窗預覽 |
| `drawer` | 右側滑出視窗預覽 |
| `component` | 前端元件區塊骨架 |
| `api` | API 資料介面 |
| `query` | View / Query 查詢介面 |
| `procedure` | Stored Procedure 執行結果介面 |
| `formList` | 表單清單介面 |
| `formCreate` | 表單建立介面 |
| `formDetail` | 表單明細 / 審核介面 |
| `pageDesigner` | WYSIWYG 頁面設計入口 |
| `formCompletedData` | 表單簽核完成資料介面 |

## WYSIWYG 設計器說明

本次沒有安裝外部 npm 套件，避免破壞既有環境。實作方式是先建立「套件 Adapter 設定層」：

- `builtInBlocks`：內建保底區塊設計器，可直接在目前前端預覽。
- `grapesjs`：未來可接 GrapesJS。
- `tiptap`：未來可接 Tiptap。
- `editorjs`：未來可接 Editor.js。
- `tinymce`：未來可接 TinyMCE。
- `quill`：未來可接 Quill。

目前前端會先用 `builtInBlocks` 顯示可編輯區塊，後續若要正式導入外部套件，只需要在 Adapter 層替換成真正 editor component。

## 驗證

已執行：

```bash
npx --yes tsc --jsx react --allowJs --checkJs false --noEmit --target ES2020 --module ESNext App.jsx
```

結果：通過。

另已確認 `Program.cs` 與上一版完全相同。
