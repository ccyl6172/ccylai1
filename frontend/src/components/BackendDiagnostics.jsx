import React, { useState } from 'react';
import { API_BASE_URL, checkBackendHealth, syncFullState, testPayload } from '../services/bpmApi';

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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ border: '1px solid #cbd5e1', borderRadius: 12, padding: 16, background: '#fff', marginBottom: 16 }}>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>後端連線診斷</div>
      <div style={{ fontSize: 13, color: '#475569', marginBottom: 12 }}>API：{API_BASE_URL}</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button type="button" disabled={loading} onClick={() => run('health')}>測試 /api/init</button>
        <button type="button" disabled={loading} onClick={() => run('sync-sample')}>同步測試 Metadata</button>
        <button type="button" disabled={loading} onClick={() => run('sync-current')}>同步目前狀態</button>
      </div>
      {result && (
        <pre style={{ marginTop: 12, maxHeight: 260, overflow: 'auto', background: '#0f172a', color: '#d1fae5', padding: 12, borderRadius: 8 }}>
{JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
