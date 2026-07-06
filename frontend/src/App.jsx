import React, { useCallback, useEffect, useMemo, useState } from 'react';
import DynamicForm from './components/DynamicForm.jsx';
import PaginatedContainer from './components/PaginatedContainer.jsx';
import AdvancedSelector from './components/AdvancedSelector.jsx';
import WorkflowPanel from './components/WorkflowPanel.jsx';
import BackendDiagnostics from './components/Diagnostics/BackendDiagnostics.jsx';
import { CONFIG, LOCAL_STORAGE_KEY } from './config/appConfig.js';
import { seedState } from './data/seedState.js';
import { API } from './services/bpmApi.js';
import { loadLocalState } from './services/localStateStore.js';
import { parseJsonSafe } from './utils/jsonUtils.js';

export default function App() {
  const [state, setState] = useState(seedState);
  const [formData, setFormData] = useState({ requestNo: 'REQ-001', amount: 1200, dept: 'IT', reason: '測試 metadata driven form', items: [{ itemName: '筆電', qty: 1, price: 1200 }] });
  const [currentState, setCurrentState] = useState('Draft');
  const [role, setRole] = useState('USER');
  const [message, setMessage] = useState('');
  const [validationReport, setValidationReport] = useState(null);

  useEffect(() => {
    const local = loadLocalState() || parseJsonSafe(localStorage.getItem(LOCAL_STORAGE_KEY), null);
    if (local) setState(local);

    if (!CONFIG.USE_REAL_BACKEND) return;

    API.getInitData()
      .then(remote => {
        if (remote && remote.params) setState(remote);
      })
      .catch(() => setMessage('後端尚未啟動，目前使用前端 seedState。'));
  }, []);

  const orgOptions = useMemo(() => {
    const org = state.params?.find(p => p.code === 'ORG-DEPT');
    return (org?.items || []).map(x => ({ label: `${x.code} - ${x.name}`, value: x.code }));
  }, [state.params]);

  const context = useMemo(() => ({
    mode: 'create',
    currentState,
    role,
    resolveDynamicOptions: (code) => code === 'ORG-DEPT' ? orgOptions : []
  }), [currentState, role, orgOptions]);

  const syncState = async () => {
    setMessage('同步中...');
    try {
      const result = await API.syncFullState(state, { allowLocalFallback: false });
      setMessage(result.message || '✅ 已成功同步到 SQL Server 後端');
    } catch (err) {
      setMessage(`❌ 同步失敗：${err.message}`);
    }
  };

  const validateState = async () => {
    try {
      const report = await API.validate(state);
      setValidationReport(report);
      setMessage(report.success ? '✅ Metadata 驗證通過' : '⚠️ Metadata 有問題，請看下方報告');
    } catch (err) {
      setMessage(`❌ 驗證失敗：${err.message}`);
    }
  };

  const handleTransition = useCallback(async (t) => {
    try {
      await API.canTransition({ workflowCode: 'PURCHASE', from: t.from, to: t.to, role });
      setCurrentState(t.to);
      setMessage(`✅ 狀態已流轉：${t.from} -> ${t.to}`);
    } catch (err) {
      setMessage(`❌ 流程拒絕：${err.message}`);
    }
  }, [role]);

  const orgCat = state.params?.find(p => p.code === 'ORG-DEPT');
  const workflow = state.workflowDefinitions?.PURCHASE;

  return (
    <main className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Metadata-Driven ERP/BPM</p>
          <h1>企業級無程式碼流程引擎 - Refactor Edition</h1>
          <p>React 完全依 schema 渲染；C# 後端負責驗證、流程、安全與資料持久化。</p>
        </div>
        <div className="toolbar">
          <select value={role} onChange={e => setRole(e.target.value)}><option>USER</option><option>MANAGER</option><option>ADMIN</option></select>
          <button onClick={validateState}>驗證 Metadata</button>
          <button onClick={syncState}>同步狀態</button>
        </div>
      </header>

      {message && <div className="toast">{message}</div>}

      <BackendDiagnostics getCurrentState={() => state} />

      <section className="grid-two">
        <DynamicForm schema={state.formSchemas?.BPM_FORM || []} data={formData} onChange={setFormData} context={context} />
        <div className="form-card">
          <WorkflowPanel workflow={workflow} currentState={currentState} role={role} onTransition={handleTransition} />
          <h3>AdvancedSelector 測試</h3>
          <AdvancedSelector options={orgOptions} filterSchema={[{ key: 'keyword', label: '關鍵字' }]} value={formData.dept} onChange={v => setFormData(p => ({ ...p, dept: v }))} onCreateNew={() => setMessage('觸發 ___CREATE_NEW___：可在這裡開啟新增主檔視窗')} />
          <h3>Tree Pagination 測試</h3>
          <PaginatedContainer data={orgCat?.items || []} dataType="tree" treeParentKey="parentCode" treePkKey="code" pageSize={1} renderRow={(row) => <div className="tree-row" key={row.id}>{row.code} / {row.name} / parent={row.parentCode || 'ROOT'}</div>} />
        </div>
      </section>

      {validationReport && (
        <section className="form-card">
          <h2>Metadata Validation Report</h2>
          {validationReport.issues?.length ? <table><thead><tr><th>Code</th><th>Message</th><th>Path</th></tr></thead><tbody>{validationReport.issues.map((i, idx) => <tr key={idx}><td>{i.code || i.Code}</td><td>{i.message || i.Message}</td><td>{i.path || i.Path}</td></tr>)}</tbody></table> : <p>沒有錯誤。</p>}
        </section>
      )}

      <section className="form-card">
        <h2>目前表單 JSON</h2>
        <pre>{JSON.stringify({ currentState, role, formData }, null, 2)}</pre>
      </section>
    </main>
  );
}
