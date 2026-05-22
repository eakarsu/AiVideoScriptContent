// NON-VIZ 2: Storyboard Builder.
// Multi-scene composer: CSS grid panels with caption + image URL + camera angle + duration.
// "Save layout" persists to /api/custom-views/storyboard.
import { useEffect, useState } from 'react';

const CAMERA_ANGLES = ['Wide', 'Medium', 'Close-up', 'Over-shoulder', 'Top-down', 'Tracking'];

function authHeaders(extra = {}) {
  const token = (typeof localStorage !== 'undefined' && localStorage.getItem('token')) || '';
  return { ...extra, ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

function blankPanel(i) {
  return { caption: `Panel ${i + 1}`, imageUrl: '', cameraAngle: 'Medium', duration: 5 };
}

export default function StoryboardBuilder() {
  const [name, setName] = useState('Untitled Storyboard');
  const [panels, setPanels] = useState([blankPanel(0), blankPanel(1), blankPanel(2), blankPanel(3)]);
  const [saved, setSaved] = useState([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    fetch('/api/custom-views/storyboard', { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => setSaved(d.layouts || []))
      .catch(() => {});
  }, []);

  const updatePanel = (idx, key, value) => {
    setPanels((arr) => arr.map((p, i) => (i === idx ? { ...p, [key]: value } : p)));
  };

  const addPanel = () => setPanels((arr) => [...arr, blankPanel(arr.length)]);
  const removePanel = (idx) => setPanels((arr) => arr.filter((_, i) => i !== idx));

  const save = async () => {
    setBusy(true); setMsg(null);
    try {
      const res = await fetch('/api/custom-views/storyboard', {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ name, panels }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'save failed');
      setMsg(`Saved "${data.layout.name}" (${data.layout.panels.length} panels).`);
      const refresh = await fetch('/api/custom-views/storyboard', { headers: authHeaders() }).then((r) => r.json());
      setSaved(refresh.layouts || []);
    } catch (e) {
      setMsg(`Save failed: ${e.message}`);
    } finally {
      setBusy(false);
    }
  };

  const totalDuration = panels.reduce((acc, p) => acc + (Number(p.duration) || 0), 0);

  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 20, background: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#0f172a' }}>Storyboard Builder</h3>
        <span style={{ fontSize: 12, color: '#64748b' }}>
          {panels.length} panels - {totalDuration}s total
        </span>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Storyboard name"
          style={{ flex: 1, padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 13 }}
        />
        <button
          onClick={addPanel}
          style={{ padding: '8px 14px', border: '1px solid #cbd5e1', borderRadius: 6, background: '#f8fafc', fontSize: 13, cursor: 'pointer' }}
        >+ Panel</button>
        <button
          onClick={save}
          disabled={busy}
          style={{
            padding: '8px 14px', border: 'none', borderRadius: 6,
            background: busy ? '#94a3b8' : '#2563eb', color: '#fff', fontWeight: 600,
            fontSize: 13, cursor: busy ? 'wait' : 'pointer',
          }}
        >{busy ? 'Saving...' : 'Save Layout'}</button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: 14,
      }}>
        {panels.map((p, i) => (
          <div key={i} style={{
            border: '1px solid #e2e8f0', borderRadius: 10, padding: 10, background: '#f8fafc',
          }}>
            <div style={{
              height: 100, marginBottom: 8, borderRadius: 6,
              background: p.imageUrl ? `url(${p.imageUrl}) center/cover` : 'linear-gradient(135deg,#1e293b,#475569)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 24, fontWeight: 700,
              position: 'relative',
            }}>
              {!p.imageUrl && <span>#{i + 1}</span>}
              <span style={{
                position: 'absolute', bottom: 6, right: 6,
                background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: 10, fontWeight: 600,
                padding: '2px 6px', borderRadius: 10,
              }}>{p.duration}s</span>
            </div>
            <input
              value={p.caption}
              onChange={(e) => updatePanel(i, 'caption', e.target.value)}
              placeholder="Caption"
              style={{ width: '100%', padding: '6px 8px', fontSize: 12, border: '1px solid #cbd5e1', borderRadius: 4, marginBottom: 6, boxSizing: 'border-box' }}
            />
            <input
              value={p.imageUrl}
              onChange={(e) => updatePanel(i, 'imageUrl', e.target.value)}
              placeholder="Image URL"
              style={{ width: '100%', padding: '6px 8px', fontSize: 12, border: '1px solid #cbd5e1', borderRadius: 4, marginBottom: 6, boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: 6 }}>
              <select
                value={p.cameraAngle}
                onChange={(e) => updatePanel(i, 'cameraAngle', e.target.value)}
                style={{ flex: 1, padding: '5px', fontSize: 12, border: '1px solid #cbd5e1', borderRadius: 4 }}
              >
                {CAMERA_ANGLES.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
              <input
                type="number"
                min={1}
                value={p.duration}
                onChange={(e) => updatePanel(i, 'duration', Number(e.target.value))}
                style={{ width: 60, padding: '5px', fontSize: 12, border: '1px solid #cbd5e1', borderRadius: 4 }}
              />
              <button
                onClick={() => removePanel(i)}
                style={{ padding: '5px 8px', fontSize: 12, border: '1px solid #fca5a5', background: '#fef2f2', color: '#b91c1c', borderRadius: 4, cursor: 'pointer' }}
              >X</button>
            </div>
          </div>
        ))}
      </div>

      {msg && (
        <div style={{
          marginTop: 12, padding: 10, borderRadius: 6,
          background: msg.startsWith('Save failed') ? '#fee2e2' : '#dcfce7',
          color: msg.startsWith('Save failed') ? '#991b1b' : '#166534',
          fontSize: 13,
        }}>{msg}</div>
      )}

      {saved.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: 13, fontWeight: 600, color: '#0f172a' }}>Saved layouts</h4>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: '#475569' }}>
            {saved.slice(0, 5).map((l) => (
              <li key={l.id}>{l.name} - {l.panels.length} panels - {new Date(l.savedAt).toLocaleString()}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
