import { useState, useEffect } from 'react';
import PageLayout from '../components/PageLayout';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import ItemForm from '../components/ItemForm';
import DraftPublishModal from '../components/DraftPublishModal';
import { api, getFeatureById } from '../services/api';

interface Repurpose {
  id: number;
  originalContent: string;
  sourcePlatform: string;
  targetPlatform: string;
  contentType: string;
  aiOutput: string;
  status: 'draft' | 'scheduled' | 'published';
  scheduledAt: string | null;
  createdAt: string;
}

const platformIcons: Record<string, string> = {
  YouTube: '📺',
  TikTok: '🎵',
  Instagram: '📸',
  Twitter: '🐦',
  LinkedIn: '💼',
  Blog: '📝',
  Podcast: '🎙️',
};

export default function RepurposePage() {
  const [items, setItems] = useState<Repurpose[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<Repurpose | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);

  const feature = getFeatureById('repurpose')!;

  useEffect(() => {
    fetchItems();
  }, [statusFilter]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const endpoint = statusFilter !== 'all' ? `/repurpose?status=${statusFilter}` : '/repurpose';
      const response = await api.get(endpoint);
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching repurpose items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: any) => {
    try {
      await api.post('/repurpose', data);
      await fetchItems();
      setShowForm(false);
    } catch (error) {
      throw error;
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this repurposed content?')) return;
    try {
      await api.delete(`/repurpose/${id}`);
      await fetchItems();
      setSelectedItem(null);
    } catch (error) {
      console.error('Error deleting repurpose:', error);
    }
  };

  const handleStatusSave = async (status: 'draft' | 'scheduled' | 'published', scheduledAt: string | null) => {
    if (!selectedItem) return;
    try {
      await api.put(`/repurpose/${selectedItem.id}`, { status, scheduledAt });
      await fetchItems();
      setShowStatusModal(false);
      setSelectedItem(null);
    } catch (error) {
      throw error;
    }
  };

  const filteredItems = items.filter((item) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      item.sourcePlatform.toLowerCase().includes(search) ||
      item.targetPlatform.toLowerCase().includes(search) ||
      item.contentType.toLowerCase().includes(search) ||
      item.originalContent?.toLowerCase().includes(search)
    );
  });

  return (
    <PageLayout
      title="Repurpose"
      subtitle="Transform content across platforms"
      icon="🔄"
      actions={
        <button onClick={() => setShowForm(true)} className="btn-primary">
          + Repurpose Content
        </button>
      }
    >
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search repurposed content..."
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

      {/* Repurpose Items Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading repurposed content...</div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-gray-500 mb-4">No repurposed content found. Transform your first piece!</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            + Repurpose Content
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="bg-white rounded-lg shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow"
            >
              {/* Transformation Arrow */}
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
                  <span className="text-xl">{platformIcons[item.sourcePlatform] || '📱'}</span>
                  <span className="text-sm font-medium">{item.sourcePlatform}</span>
                </div>
                <span className="text-emerald-500 text-xl">→</span>
                <div className="flex items-center gap-2 bg-emerald-100 px-3 py-2 rounded-lg">
                  <span className="text-xl">{platformIcons[item.targetPlatform] || '📱'}</span>
                  <span className="text-sm font-medium">{item.targetPlatform}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">{item.contentType}</span>
                <StatusBadge status={item.status || 'draft'} size="sm" />
              </div>

              <p className="text-sm text-gray-600 line-clamp-2">
                {item.originalContent?.substring(0, 100)}...
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal with Workflow View */}
      {selectedItem && !showStatusModal && (
        <Modal title="Content Transformation" onClose={() => setSelectedItem(null)}>
          <div className="space-y-4">
            {/* Transformation Flow */}
            <div className="flex items-center justify-center gap-4 py-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl shadow mx-auto mb-2">
                  {platformIcons[selectedItem.sourcePlatform] || '📱'}
                </div>
                <p className="text-sm font-medium">{selectedItem.sourcePlatform}</p>
              </div>
              <div className="text-3xl text-emerald-500">→</div>
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-3xl shadow mx-auto mb-2">
                  {platformIcons[selectedItem.targetPlatform] || '📱'}
                </div>
                <p className="text-sm font-medium">{selectedItem.targetPlatform}</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm bg-gray-100 px-3 py-1 rounded-full">{selectedItem.contentType}</span>
              <StatusBadge status={selectedItem.status || 'draft'} />
            </div>

            {/* Original Content */}
            <div>
              <span className="text-sm text-gray-500">Original Content:</span>
              <div className="mt-2 bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                <p className="text-sm">{selectedItem.originalContent}</p>
              </div>
            </div>

            {/* Transformed Content */}
            {selectedItem.aiOutput && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Transformed Content:</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedItem.aiOutput);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className={`text-xs px-3 py-1 rounded-full ${
                      copied ? 'bg-green-100 text-green-700' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                    }`}
                  >
                    {copied ? 'Copied!' : 'Copy Output'}
                  </button>
                </div>
                <div className="bg-emerald-50 rounded-lg p-4 max-h-60 overflow-y-auto border border-emerald-100">
                  <pre className="text-sm whitespace-pre-wrap">{selectedItem.aiOutput}</pre>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4 border-t">
              <button onClick={() => handleDelete(selectedItem.id)} className="text-red-600 hover:text-red-800">
                Delete
              </button>
              <div className="flex gap-2">
                <button onClick={() => setShowStatusModal(true)} className="btn-secondary">
                  Change Status
                </button>
                <button onClick={() => setSelectedItem(null)} className="btn-primary">
                  Close
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Form Modal */}
      {showForm && (
        <Modal title="Repurpose Content" onClose={() => setShowForm(false)}>
          <ItemForm feature={feature} onSave={handleSave} onCancel={() => setShowForm(false)} />
        </Modal>
      )}

      {/* Status Modal */}
      {showStatusModal && selectedItem && (
        <DraftPublishModal
          currentStatus={selectedItem.status || 'draft'}
          scheduledAt={selectedItem.scheduledAt}
          onClose={() => {
            setShowStatusModal(false);
            setSelectedItem(null);
          }}
          onSave={handleStatusSave}
        />
      )}
    </PageLayout>
  );
}
