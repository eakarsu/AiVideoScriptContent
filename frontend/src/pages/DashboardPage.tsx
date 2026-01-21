import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api, FEATURES } from '../services/api';

interface FeatureCounts {
  [key: string]: number;
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [counts, setCounts] = useState<FeatureCounts>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const countsData: FeatureCounts = {};

        // Fetch counts for each feature in parallel
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
    navigate(`/feature/${featureId}`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Content Creator</h1>
            <p className="text-sm text-gray-600">Welcome back, {user?.name}</p>
          </div>
          <button
            onClick={logout}
            className="btn-secondary"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Your AI Tools</h2>
          <p className="text-gray-600">Select a tool to get started with AI-powered content creation</p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {FEATURES.map((feature) => (
            <div
              key={feature.id}
              onClick={() => handleFeatureClick(feature.id)}
              className="feature-card bg-white rounded-xl shadow-md p-6 cursor-pointer border border-gray-100 hover:border-primary-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`${feature.color} w-12 h-12 rounded-lg flex items-center justify-center text-2xl`}>
                  {feature.icon}
                </div>
                {!loading && (
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                    {counts[feature.id] || 0} items
                  </span>
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                {feature.name}
              </h3>
              <p className="text-sm text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Stats</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-primary-50 rounded-lg p-4">
              <p className="text-3xl font-bold text-primary-600">
                {loading ? '-' : Object.values(counts).reduce((a, b) => a + b, 0)}
              </p>
              <p className="text-sm text-gray-600">Total Items</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-3xl font-bold text-green-600">15</p>
              <p className="text-sm text-gray-600">AI Tools</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-3xl font-bold text-purple-600">3</p>
              <p className="text-sm text-gray-600">Platforms</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <p className="text-3xl font-bold text-orange-600">24/7</p>
              <p className="text-sm text-gray-600">AI Available</p>
            </div>
          </div>
        </div>

        {/* Getting Started */}
        <div className="mt-8 bg-gradient-to-r from-primary-500 to-purple-600 rounded-xl shadow-md p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Getting Started</h3>
          <p className="text-primary-100 mb-4">
            Click on any feature card above to view your items, create new content with AI, or manage existing items.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
              1. Choose a tool
            </span>
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
              2. Click "New Item"
            </span>
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
              3. Generate with AI
            </span>
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
              4. Save & Use
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
