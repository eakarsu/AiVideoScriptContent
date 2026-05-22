// VIZ 1: Horizontal timeline of script beats (hook / setup / conflict / climax / resolution)
// with seconds per beat. Pure inline-styles so no AIPage/App.css mods required.
import { useEffect, useState } from 'react';

function authHeaders() {
  const token = (typeof localStorage !== 'undefined' && localStorage.getItem('token')) || '';
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function ScriptBeatTimeline({ scriptId = null }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const qs = scriptId ? `?scriptId=${encodeURIComponent(scriptId)}` : '';
    fetch(`/api/custom-views/beats${qs}`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => { if (!cancelled) setData(d); })
      .catch((e) => { if (!cancelled) setError(e.message || 'load failed'); });
    return () => { cancelled = true; };
  }, [scriptId]);

  if (error) return <div style={{ color: '#dc2626', padding: 12 }}>Beats error: {error}</div>;
  if (!data) return <div style={{ padding: 12, color: '#64748b' }}>Loading beats...</div>;

  const total = data.totalSeconds || 1;

  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 20, background: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#0f172a' }}>
          Beat Timeline - {data.scriptTitle}
        </h3>
        <span style={{ fontSize: 13, color: '#64748b' }}>Total {total}s</span>
      </div>

      {/* Horizontal segmented timeline */}
      <div style={{
        display: 'flex',
        width: '100%',
        height: 36,
        borderRadius: 8,
        overflow: 'hidden',
        boxShadow: 'inset 0 0 0 1px #e2e8f0',
      }}>
        {data.beats.map((b) => (
          <div
            key={b.key}
            title={`${b.label}: ${b.seconds}s (${b.start}-${b.end}s)`}
            style={{
              flex: b.seconds / total,
              background: b.color,
              color: '#fff',
              fontSize: 11,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              minWidth: 0,
            }}
          >
            {b.label}
          </div>
        ))}
      </div>

      {/* Per-beat seconds row */}
      <div style={{ display: 'flex', marginTop: 10, gap: 8, flexWrap: 'wrap' }}>
        {data.beats.map((b) => (
          <div key={b.key} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: '#f8fafc', borderRadius: 6, padding: '4px 10px', fontSize: 12,
          }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: b.color }} />
            <strong style={{ color: '#0f172a' }}>{b.label}</strong>
            <span style={{ color: '#475569' }}>{b.seconds}s</span>
          </div>
        ))}
      </div>
    </div>
  );
}
