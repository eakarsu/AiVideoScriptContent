// VIZ 2: CSS grid of scenes with placeholder thumbnail + scene number + duration badge.
import { useEffect, useState } from 'react';

function authHeaders() {
  const token = (typeof localStorage !== 'undefined' && localStorage.getItem('token')) || '';
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function SceneGallery({ scriptId = null }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const qs = scriptId ? `?scriptId=${encodeURIComponent(scriptId)}` : '';
    fetch(`/api/custom-views/scenes${qs}`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => { if (!cancelled) setData(d); })
      .catch((e) => { if (!cancelled) setError(e.message || 'load failed'); });
    return () => { cancelled = true; };
  }, [scriptId]);

  if (error) return <div style={{ color: '#dc2626', padding: 12 }}>Scenes error: {error}</div>;
  if (!data) return <div style={{ padding: 12, color: '#64748b' }}>Loading scenes...</div>;

  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 20, background: '#fff' }}>
      <h3 style={{ margin: '0 0 12px 0', fontSize: 16, fontWeight: 600, color: '#0f172a' }}>
        Scene Gallery - {data.scriptTitle}
      </h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: 16,
      }}>
        {data.scenes.map((s) => (
          <div key={s.sceneNumber} style={{
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            overflow: 'hidden',
            background: '#f8fafc',
          }}>
            {/* Placeholder thumbnail */}
            <div style={{
              height: 110,
              background: `linear-gradient(135deg, ${s.color} 0%, #0f172a 100%)`,
              position: 'relative',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 42, fontWeight: 700,
            }}>
              {s.sceneNumber}
              {/* Duration badge */}
              <span style={{
                position: 'absolute', bottom: 8, right: 8,
                background: 'rgba(0,0,0,0.7)', color: '#fff',
                fontSize: 11, fontWeight: 600,
                padding: '3px 8px', borderRadius: 12,
              }}>
                {s.duration}s
              </span>
              {/* Camera angle pill */}
              <span style={{
                position: 'absolute', top: 8, left: 8,
                background: 'rgba(255,255,255,0.92)', color: '#0f172a',
                fontSize: 10, fontWeight: 600,
                padding: '2px 6px', borderRadius: 4,
              }}>
                {s.cameraAngle}
              </span>
            </div>
            <div style={{ padding: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>
                Scene {s.sceneNumber}
              </div>
              <div style={{ fontSize: 11, color: '#475569', lineHeight: 1.35 }}>
                {s.caption}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
