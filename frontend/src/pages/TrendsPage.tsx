import { useState, useEffect } from 'react';
import PageLayout from '../components/PageLayout';
import ContentCard from '../components/ContentCard';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import ItemForm from '../components/ItemForm';
import DraftPublishModal from '../components/DraftPublishModal';
import { api, getFeatureById } from '../services/api';

interface Trend {
  id: number;
  niche: string;
  platform: string;
  timeframe: string;
  region: string;
  aiOutput: string;
  status: 'draft' | 'scheduled' | 'published';
  scheduledAt: string | null;
  createdAt: string;
}

export default function TrendsPage() {
  const [trends, setTrends] = useState<Trend[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrend, setSelectedTrend] = useState<Trend | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const feature = getFeatureById('trends')!;

  useEffect(() => {
    fetchTrends();
  }, [statusFilter]);

  const fetchTrends = async () => {
    setLoading(true);
    try {
      const endpoint = statusFilter !== 'all' ? `/trends?status=${statusFilter}` : '/trends';
      const response = await api.get(endpoint);
      setTrends(response.data);
    } catch (error) {
      console.error('Error fetching trends:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: any) => {
    try {
      await api.post('/trends', data);
      await fetchTrends();
      setShowForm(false);
    } catch (error) {
      throw error;
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this trend analysis?')) return;
    try {
      await api.delete(`/trends/${id}`);
      await fetchTrends();
      setSelectedTrend(null);
    } catch (error) {
      console.error('Error deleting trend:', error);
    }
  };

  const handleStatusSave = async (status: 'draft' | 'scheduled' | 'published', scheduledAt: string | null) => {
    if (!selectedTrend) return;
    try {
      await api.put(`/trends/${selectedTrend.id}`, { status, scheduledAt });
      await fetchTrends();
      setShowStatusModal(false);
      setSelectedTrend(null);
    } catch (error) {
      throw error;
    }
  };

  const filteredTrends = trends.filter((trend) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      trend.niche.toLowerCase().includes(search) ||
      trend.platform.toLowerCase().includes(search) ||
      trend.aiOutput?.toLowerCase().includes(search)
    );
  });

  return (
    <PageLayout
      title="Trends"
      subtitle="Analyze current trends in your niche"
      icon="📈"
      actions={
        <button onClick={() => setShowForm(true)} className="btn-primary">
          + New Analysis
        </button>
      }
    >
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search trends..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field flex-1"
        />
        <div className="flex gap-2">
          {['all', 'draft', 'scheduled', 'published'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Trends Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading trends...</div>
      ) : filteredTrends.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-gray-500 mb-4">No trend analyses found. Create your first one!</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            + Analyze Trends
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTrends.map((trend) => (
            <ContentCard
              key={trend.id}
              id={trend.id}
              title={trend.niche}
              subtitle={`${trend.platform} - ${trend.timeframe}`}
              status={trend.status || 'draft'}
              scheduledAt={trend.scheduledAt}
              createdAt={trend.createdAt}
              icon="📈"
              color="bg-orange-100"
              onClick={() => setSelectedTrend(trend)}
              onStatusClick={() => {
                setSelectedTrend(trend);
                setShowStatusModal(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedTrend && !showStatusModal && (
        <Modal title="Trend Analysis" onClose={() => setSelectedTrend(null)}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{selectedTrend.niche}</h3>
              <StatusBadge status={selectedTrend.status || 'draft'} />
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Platform:</span>
                <p className="font-medium">{selectedTrend.platform}</p>
              </div>
              <div>
                <span className="text-gray-500">Timeframe:</span>
                <p className="font-medium">{selectedTrend.timeframe}</p>
              </div>
              <div>
                <span className="text-gray-500">Region:</span>
                <p className="font-medium">{selectedTrend.region || 'Global'}</p>
              </div>
            </div>

            {selectedTrend.aiOutput && (
              <div>
                <span className="text-sm text-gray-500">Trend Analysis:</span>
                <div className="mt-2 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg p-4 max-h-80 overflow-y-auto border border-orange-100">
                  <pre className="text-sm whitespace-pre-wrap">{selectedTrend.aiOutput}</pre>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4 border-t">
              <button onClick={() => handleDelete(selectedTrend.id)} className="text-red-600 hover:text-red-800">
                Delete
              </button>
              <div className="flex gap-2">
                <button onClick={() => setShowStatusModal(true)} className="btn-secondary">
                  Change Status
                </button>
                <button onClick={() => setSelectedTrend(null)} className="btn-primary">
                  Close
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Form Modal */}
      {showForm && (
        <Modal title="New Trend Analysis" onClose={() => setShowForm(false)}>
          <ItemForm feature={feature} onSave={handleSave} onCancel={() => setShowForm(false)} />
        </Modal>
      )}

      {/* Status Modal */}
      {showStatusModal && selectedTrend && (
        <DraftPublishModal
          currentStatus={selectedTrend.status || 'draft'}
          scheduledAt={selectedTrend.scheduledAt}
          onClose={() => {
            setShowStatusModal(false);
            setSelectedTrend(null);
          }}
          onSave={handleStatusSave}
        />
      )}
    </PageLayout>
  );
}
