import { useState, useEffect } from 'react';
import PageLayout from '../components/PageLayout';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import ItemForm from '../components/ItemForm';
import DraftPublishModal from '../components/DraftPublishModal';
import { api, getFeatureById } from '../services/api';
import { format } from 'date-fns';

interface Thumbnail {
  id: number;
  videoTitle: string;
  topic: string;
  style: string;
  colorScheme: string;
  aiOutput: string;
  status: 'draft' | 'scheduled' | 'published';
  scheduledAt: string | null;
  createdAt: string;
}

const styleColors: Record<string, string> = {
  Minimal: 'from-gray-100 to-gray-300',
  Bold: 'from-red-400 to-orange-500',
  'Face Focus': 'from-blue-400 to-purple-500',
  'Before/After': 'from-green-400 to-blue-500',
  'Text Heavy': 'from-yellow-400 to-red-500',
};

export default function ThumbnailsPage() {
  const [thumbnails, setThumbnails] = useState<Thumbnail[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedThumbnail, setSelectedThumbnail] = useState<Thumbnail | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const feature = getFeatureById('thumbnails')!;

  useEffect(() => {
    fetchThumbnails();
  }, [statusFilter]);

  const fetchThumbnails = async () => {
    setLoading(true);
    try {
      const endpoint = statusFilter !== 'all' ? `/thumbnails?status=${statusFilter}` : '/thumbnails';
      const response = await api.get(endpoint);
      setThumbnails(response.data);
    } catch (error) {
      console.error('Error fetching thumbnails:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: any) => {
    try {
      await api.post('/thumbnails', data);
      await fetchThumbnails();
      setShowForm(false);
    } catch (error) {
      throw error;
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this thumbnail idea?')) return;
    try {
      await api.delete(`/thumbnails/${id}`);
      await fetchThumbnails();
      setSelectedThumbnail(null);
    } catch (error) {
      console.error('Error deleting thumbnail:', error);
    }
  };

  const handleStatusSave = async (status: 'draft' | 'scheduled' | 'published', scheduledAt: string | null) => {
    if (!selectedThumbnail) return;
    try {
      await api.put(`/thumbnails/${selectedThumbnail.id}`, { status, scheduledAt });
      await fetchThumbnails();
      setShowStatusModal(false);
      setSelectedThumbnail(null);
    } catch (error) {
      throw error;
    }
  };

  const filteredThumbnails = thumbnails.filter((t) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      t.videoTitle.toLowerCase().includes(search) ||
      t.topic.toLowerCase().includes(search) ||
      t.style.toLowerCase().includes(search)
    );
  });

  return (
    <PageLayout
      title="Thumbnails"
      subtitle="Visual thumbnail ideas for your videos"
      icon="🖼️"
      actions={
        <button onClick={() => setShowForm(true)} className="btn-primary">
          + New Thumbnail
        </button>
      }
    >
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search thumbnails..."
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

      {/* Thumbnails Grid - Visual Card Layout */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading thumbnails...</div>
      ) : filteredThumbnails.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-gray-500 mb-4">No thumbnails found. Create your first one!</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            + Create Thumbnail
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredThumbnails.map((thumbnail) => (
            <div
              key={thumbnail.id}
              onClick={() => setSelectedThumbnail(thumbnail)}
              className="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
            >
              {/* Visual Preview */}
              <div className={`h-32 bg-gradient-to-br ${styleColors[thumbnail.style] || 'from-gray-200 to-gray-400'} flex items-center justify-center relative`}>
                <span className="text-4xl">🖼️</span>
                <div className="absolute top-2 right-2">
                  <StatusBadge status={thumbnail.status || 'draft'} size="sm" />
                </div>
                <div className="absolute bottom-2 left-2">
                  <span className="bg-white/80 backdrop-blur-sm text-xs px-2 py-1 rounded">
                    {thumbnail.style}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-medium text-gray-900 truncate">{thumbnail.videoTitle}</h3>
                <p className="text-sm text-gray-500 truncate">{thumbnail.topic}</p>
                <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                  <span>{format(new Date(thumbnail.createdAt), 'MMM d, yyyy')}</span>
                  {thumbnail.colorScheme && (
                    <span className="bg-gray-100 px-2 py-0.5 rounded">{thumbnail.colorScheme}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedThumbnail && !showStatusModal && (
        <Modal title="Thumbnail Details" onClose={() => setSelectedThumbnail(null)}>
          <div className="space-y-4">
            {/* Visual Header */}
            <div className={`h-40 rounded-lg bg-gradient-to-br ${styleColors[selectedThumbnail.style] || 'from-gray-200 to-gray-400'} flex items-center justify-center`}>
              <span className="text-6xl">🖼️</span>
            </div>

            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{selectedThumbnail.videoTitle}</h3>
              <StatusBadge status={selectedThumbnail.status || 'draft'} />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Topic:</span>
                <p className="font-medium">{selectedThumbnail.topic}</p>
              </div>
              <div>
                <span className="text-gray-500">Style:</span>
                <p className="font-medium">{selectedThumbnail.style}</p>
              </div>
              {selectedThumbnail.colorScheme && (
                <div className="col-span-2">
                  <span className="text-gray-500">Color Scheme:</span>
                  <p className="font-medium">{selectedThumbnail.colorScheme}</p>
                </div>
              )}
            </div>

            {selectedThumbnail.aiOutput && (
              <div>
                <span className="text-sm text-gray-500">AI Thumbnail Ideas:</span>
                <div className="mt-2 bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                  <pre className="text-sm whitespace-pre-wrap">{selectedThumbnail.aiOutput}</pre>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4 border-t">
              <button onClick={() => handleDelete(selectedThumbnail.id)} className="text-red-600 hover:text-red-800">
                Delete
              </button>
              <div className="flex gap-2">
                <button onClick={() => setShowStatusModal(true)} className="btn-secondary">
                  Change Status
                </button>
                <button onClick={() => setSelectedThumbnail(null)} className="btn-primary">
                  Close
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Form Modal */}
      {showForm && (
        <Modal title="New Thumbnail" onClose={() => setShowForm(false)}>
          <ItemForm feature={feature} onSave={handleSave} onCancel={() => setShowForm(false)} />
        </Modal>
      )}

      {/* Status Modal */}
      {showStatusModal && selectedThumbnail && (
        <DraftPublishModal
          currentStatus={selectedThumbnail.status || 'draft'}
          scheduledAt={selectedThumbnail.scheduledAt}
          onClose={() => {
            setShowStatusModal(false);
            setSelectedThumbnail(null);
          }}
          onSave={handleStatusSave}
        />
      )}
    </PageLayout>
  );
}
