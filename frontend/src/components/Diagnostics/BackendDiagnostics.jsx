import React, { useState } from 'react';
import { API_BASE_URL, checkBackendHealth, syncFullState, testPayload } from '../../services/bpmApi.js';

export default function BackendDiagnostics({ getCurrentState }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const run = async (action) => {
    setLoading(true);
    try {
      if (action === 'health') {
        setResult(await checkBackendHealth());
      }
      if (action === 'sync-sample') {
        setResult(await syncFullState(testPayload, { allowLocalFallback: false }));
      }
      if (action === 'sync-current') {
        const currentState = typeof getCurrentState === 'function' ? getCurrentState() : null;
        setResult(await syncFullState(currentState || testPayload, { allowLocalFallback: false }));
      }
    } catch (error) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-card">
      <h2>後端連線診斷</h2>
      <p>API：{API_BASE_URL}</p>
      <div className="toolbar">
        <button type="button" disabled={loading} onClick={() => run('health')}>測試 /api/init</button>
        <button type="button" disabled={loading} onClick={() => run('sync-sample')}>同步測試 Metadata</button>
        <button type="button" disabled={loading} onClick={() => run('sync-current')}>同步目前狀態</button>
      </div>
      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}
