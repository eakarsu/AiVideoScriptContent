// NON-VIZ 1: Script PDF Export.
// Project picker + format selector -> downloads industry-formatted PDF (pdfkit backend).
import { useEffect, useState } from 'react';

function authHeaders(extra = {}) {
  const token = (typeof localStorage !== 'undefined' && localStorage.getItem('token')) || '';
  return { ...extra, ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

export default function ScriptPDF() {
  const [scripts, setScripts] = useState([]);
  const [scriptId, setScriptId] = useState('');
  const [format, setFormat] = useState('standard');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/scripts?limit=50', { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        const list = (d && d.data) || [];
        setScripts(list);
        if (list.length > 0) setScriptId(String(list[0].id));
      })
      .catch(() => { if (!cancelled) setScripts([]); });
    return () => { cancelled = true; };
  }, []);

  const exportPDF = async () => {
    setBusy(true); setMsg(null);
    try {
      const res = await fetch('/api/custom-views/script-pdf', {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ scriptId: scriptId ? Number(scriptId) : null, format }),
      });
      if (!res.ok) {
        const t = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status}: ${t.slice(0, 120)}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `script-${scriptId || 'sample'}-${format}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setMsg('PDF downloaded successfully.');
    } catch (e) {
      setMsg(`Export failed: ${e.message}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 20, background: '#fff' }}>
      <h3 style={{ margin: '0 0 12px 0', fontSize: 16, fontWeight: 600, color: '#0f172a' }}>
        Script PDF Export
      </h3>
      <p style={{ margin: '0 0 16px 0', fontSize: 13, color: '#64748b' }}>
        Choose a script and a format. The PDF uses industry-standard script formatting (Courier 12pt, scene-heading detection).
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: 12, alignItems: 'end' }}>
        <label style={{ display: 'flex', flexDirection: 'column', fontSize: 12, color: '#475569' }}>
          Project (script)
          <select
            value={scriptId}
            onChange={(e) => setScriptId(e.target.value)}
            style={{ marginTop: 4, padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 13 }}
          >
            {scripts.length === 0 && <option value="">(no scripts found - sample will be used)</option>}
            {scripts.map((s) => (
              <option key={s.id} value={s.id}>{s.title} ({s.platform})</option>
            ))}
          </select>
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', fontSize: 12, color: '#475569' }}>
          Format
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            style={{ marginTop: 4, padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 13 }}
          >
            <option value="standard">Standard</option>
            <option value="short-form">Short-form</option>
            <option value="long-form">Long-form</option>
          </select>
        </label>
        <button
          onClick={exportPDF}
          disabled={busy}
          style={{
            padding: '10px 16px', border: 'none', borderRadius: 6,
            background: busy ? '#94a3b8' : '#2563eb', color: '#fff',
            fontWeight: 600, fontSize: 13, cursor: busy ? 'wait' : 'pointer',
          }}
        >
          {busy ? 'Generating...' : 'Export PDF'}
        </button>
      </div>

      {msg && (
        <div style={{
          marginTop: 12, padding: 10, borderRadius: 6,
          background: msg.startsWith('Export failed') ? '#fee2e2' : '#dcfce7',
          color: msg.startsWith('Export failed') ? '#991b1b' : '#166534',
          fontSize: 13,
        }}>{msg}</div>
      )}
    </div>
  );
}
