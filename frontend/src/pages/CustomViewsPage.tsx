// Custom Views page - mounts the 4 custom view features for AiVideoScriptContent.
// 2 viz (ScriptBeatTimeline, SceneGallery) + 2 non-viz (ScriptPDF, StoryboardBuilder).
import { useEffect, useState } from 'react';
import PageLayout from '../components/PageLayout';
// @ts-ignore - .js components imported by relative path
import ScriptBeatTimeline from '../components/ScriptBeatTimeline.js';
// @ts-ignore
import SceneGallery from '../components/SceneGallery.js';
// @ts-ignore
import ScriptPDF from '../components/ScriptPDF.js';
// @ts-ignore
import StoryboardBuilder from '../components/StoryboardBuilder.js';

interface ScriptRow { id: number; title: string; platform: string }

export default function CustomViewsPage() {
  const [scripts, setScripts] = useState<ScriptRow[]>([]);
  const [selected, setSelected] = useState<string>('');

  useEffect(() => {
    const token = localStorage.getItem('token') || '';
    fetch('/api/scripts?limit=50', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => {
        const list: ScriptRow[] = (d && d.data) || [];
        setScripts(list);
        if (list.length > 0) setSelected(String(list[0].id));
      })
      .catch(() => setScripts([]));
  }, []);

  const selectedId = selected ? Number(selected) : null;

  return (
    <PageLayout
      title="Script Views"
      subtitle="Beat timelines, scene galleries, PDF export, and storyboard composer"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <label style={{ fontSize: 13, color: '#475569', fontWeight: 500 }}>Active script:</label>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            style={{ padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 13, minWidth: 280 }}
          >
            {scripts.length === 0 && <option value="">(no scripts found - sample data will be shown)</option>}
            {scripts.map((s) => (
              <option key={s.id} value={s.id}>{s.title} ({s.platform})</option>
            ))}
          </select>
        </div>

        <ScriptBeatTimeline scriptId={selectedId} />
        <SceneGallery scriptId={selectedId} />
        <ScriptPDF />
        <StoryboardBuilder />
      </div>
    </PageLayout>
  );
}
