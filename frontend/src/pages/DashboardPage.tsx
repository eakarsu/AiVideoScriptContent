import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api, FEATURES } from '../services/api';
import PageLayout from '../components/PageLayout';

interface FeatureCounts {
  [key: string]: number;
}

const featureRoutes: Record<string, string> = {
  scripts: '/scripts',
  titles: '/titles',
  descriptions: '/descriptions',
  hashtags: '/hashtags',
  thumbnails: '/thumbnails',
  hooks: '/hooks',
  captions: '/captions',
  ctas: '/ctas',
  'viral-predictions': '/viral-predictions',
  'video-summaries': '/video-summaries',
  'podcast-transcripts': '/podcast-transcripts',
  calendar: '/calendar',
  trends: '/trends',
  seo: '/seo',
  personas: '/personas',
  repurpose: '/repurpose',
  comments: '/comments',
  ideas: '/ideas',
  analytics: '/analytics-dashboard',
  competitors: '/competitors',
};

// Icon mapping for feature cards
const featureIcons: Record<string, React.ReactNode> = {
  scripts: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
  titles: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
  ),
  descriptions: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
    </svg>
  ),
  hashtags: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5l-3.9 19.5m-2.1-19.5l-3.9 19.5" />
    </svg>
  ),
  thumbnails: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 002.25-2.25V5.25a2.25 2.25 0 00-2.25-2.25H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
    </svg>
  ),
  hooks: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
    </svg>
  ),
  captions: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
    </svg>
  ),
  ctas: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
    </svg>
  ),
  'viral-predictions': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
    </svg>
  ),
  'video-summaries': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
    </svg>
  ),
  'podcast-transcripts': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
    </svg>
  ),
};

const featureColorMap: Record<string, string> = {
  scripts: 'bg-blue-50 text-blue-600',
  titles: 'bg-emerald-50 text-emerald-600',
  descriptions: 'bg-violet-50 text-violet-600',
  hashtags: 'bg-pink-50 text-pink-600',
  thumbnails: 'bg-amber-50 text-amber-600',
  hooks: 'bg-red-50 text-red-600',
  captions: 'bg-indigo-50 text-indigo-600',
  ctas: 'bg-orange-50 text-orange-600',
  'viral-predictions': 'bg-fuchsia-50 text-fuchsia-600',
  'video-summaries': 'bg-teal-50 text-teal-600',
  'podcast-transcripts': 'bg-rose-50 text-rose-600',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [counts, setCounts] = useState<FeatureCounts>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const countsData: FeatureCounts = {};
        await Promise.all(
          FEATURES.map(async (feature) => {
            try {
              const response = await api.get(feature.endpoint);
              countsData[feature.id] = response.data.length;
            } catch {
              countsData[feature.id] = 0;
            }
          })
        );
        setCounts(countsData);
      } catch (error) {
        console.error('Error fetching counts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCounts();
  }, []);

  const handleFeatureClick = (featureId: string) => {
    const route = featureRoutes[featureId] || `/feature/${featureId}`;
    navigate(route);
  };

  const contentFeatures = FEATURES.filter(f =>
    ['scripts', 'titles', 'descriptions', 'hashtags', 'thumbnails', 'hooks', 'captions'].includes(f.id)
  );
  const aiToolFeatures = FEATURES.filter(f =>
    ['ctas', 'viral-predictions', 'video-summaries', 'podcast-transcripts'].includes(f.id)
  );
  const researchFeatures = FEATURES.filter(f =>
    ['calendar', 'trends', 'seo', 'personas', 'repurpose', 'comments', 'ideas', 'analytics', 'competitors'].includes(f.id)
  );

  const totalItems = loading ? 0 : Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <PageLayout title="Dashboard" subtitle={`Welcome back, ${user?.name}`} icon="🏠">
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-5" style={{ boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.04)' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500">Total Items</span>
            <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{loading ? '--' : totalItems}</p>
          <p className="text-xs text-gray-400 mt-1">Across all tools</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5" style={{ boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.04)' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500">AI Tools</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">21</p>
          <p className="text-xs text-gray-400 mt-1">Available tools</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5" style={{ boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.04)' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500">Platforms</span>
            <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">5</p>
          <p className="text-xs text-gray-400 mt-1">Supported</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5" style={{ boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.04)' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500">AI Status</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">24/7</p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-xs text-emerald-600 font-medium">Online</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/viral-predictions')}
            className="group relative overflow-hidden bg-gradient-to-br from-violet-600 to-purple-700 text-white p-5 rounded-2xl text-left transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center mb-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                </svg>
              </div>
              <p className="font-semibold text-base">Viral Predictor</p>
              <p className="text-sm text-white/70 mt-1">Analyze viral potential</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/video-summaries')}
            className="group relative overflow-hidden bg-gradient-to-br from-teal-600 to-cyan-700 text-white p-5 rounded-2xl text-left transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center mb-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
                </svg>
              </div>
              <p className="font-semibold text-base">Video Summarizer</p>
              <p className="text-sm text-white/70 mt-1">Summarize any video</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/podcast-transcripts')}
            className="group relative overflow-hidden bg-gradient-to-br from-rose-600 to-orange-700 text-white p-5 rounded-2xl text-left transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center mb-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                </svg>
              </div>
              <p className="font-semibold text-base">Podcast Transcriber</p>
              <p className="text-sm text-white/70 mt-1">Transcribe podcasts</p>
            </div>
          </button>
        </div>
      </div>

      {/* Content Creation */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Content Creation</h2>
          <span className="text-xs text-gray-400">{contentFeatures.length} tools</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {contentFeatures.map((feature) => (
            <div
              key={feature.id}
              onClick={() => handleFeatureClick(feature.id)}
              className="feature-card bg-white rounded-2xl border border-gray-100 p-5 cursor-pointer"
              style={{ boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.04)' }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl ${featureColorMap[feature.id] || 'bg-gray-50 text-gray-600'} flex items-center justify-center`}>
                  {featureIcons[feature.id] || <span className="text-lg">{feature.icon}</span>}
                </div>
                {!loading && (
                  <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg">
                    {counts[feature.id] || 0}
                  </span>
                )}
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">{feature.name}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* AI Tools */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">AI Tools</h2>
          <span className="text-xs text-gray-400">{aiToolFeatures.length} tools</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {aiToolFeatures.map((feature) => (
            <div
              key={feature.id}
              onClick={() => handleFeatureClick(feature.id)}
              className="feature-card bg-white rounded-2xl border border-primary-100 p-5 cursor-pointer"
              style={{ boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.04)' }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl ${featureColorMap[feature.id] || 'bg-primary-50 text-primary-600'} flex items-center justify-center`}>
                  {featureIcons[feature.id] || <span className="text-lg">{feature.icon}</span>}
                </div>
                {!loading && (
                  <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2.5 py-1 rounded-lg">
                    {counts[feature.id] || 0}
                  </span>
                )}
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">{feature.name}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Research & Analysis */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Research & Analysis</h2>
          <span className="text-xs text-gray-400">{researchFeatures.length} tools</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {researchFeatures.map((feature) => (
            <div
              key={feature.id}
              onClick={() => handleFeatureClick(feature.id)}
              className="feature-card bg-white rounded-2xl border border-gray-100 p-5 cursor-pointer"
              style={{ boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.04)' }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl ${featureColorMap[feature.id] || 'bg-gray-50 text-gray-600'} flex items-center justify-center`}>
                  {featureIcons[feature.id] || <span className="text-lg">{feature.icon}</span>}
                </div>
                {!loading && (
                  <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg">
                    {counts[feature.id] || 0}
                  </span>
                )}
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">{feature.name}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Getting Started Banner */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-violet-700 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24" />
        <div className="relative">
          <h3 className="text-lg font-semibold mb-2">Getting Started</h3>
          <p className="text-primary-100 mb-5 max-w-xl text-sm">
            Click on any tool above to create new content, manage existing items, or analyze your content with AI.
          </p>
          <div className="flex flex-wrap gap-2">
            {['1. Choose a tool', '2. Click "New Item"', '3. Generate with AI', '4. Save & Schedule'].map((step) => (
              <span key={step} className="bg-white/15 backdrop-blur-sm px-4 py-1.5 rounded-lg text-sm font-medium border border-white/10">
                {step}
              </span>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
