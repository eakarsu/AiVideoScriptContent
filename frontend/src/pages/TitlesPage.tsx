import { useState, useEffect } from 'react';
import PageLayout from '../components/PageLayout';
import ContentCard from '../components/ContentCard';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import ItemForm from '../components/ItemForm';
import DraftPublishModal from '../components/DraftPublishModal';
import { api, getFeatureById } from '../services/api';

interface Title {
  id: number;
  topic: string;
  platform: string;
  style: string;
  keywords: string;
  aiOutput: string;
  status: 'draft' | 'scheduled' | 'published';
  scheduledAt: string | null;
  createdAt: string;
}

export default function TitlesPage() {
  const [titles, setTitles] = useState<Title[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTitle, setSelectedTitle] = useState<Title | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const feature = getFeatureById('titles')!;

  useEffect(() => {
    fetchTitles();
  }, [statusFilter]);

  const fetchTitles = async () => {
    setLoading(true);
    try {
      const endpoint = statusFilter !== 'all' ? `/titles?status=${statusFilter}` : '/titles';
      const response = await api.get(endpoint);
      setTitles(response.data);
    } catch (error) {
      console.error('Error fetching titles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: any) => {
    try {
      await api.post('/titles', data);
      await fetchTitles();
      setShowForm(false);
    } catch (error) {
      throw error;
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this title?')) return;
    try {
      await api.delete(`/titles/${id}`);
      await fetchTitles();
      setSelectedTitle(null);
    } catch (error) {
      console.error('Error deleting title:', error);
    }
  };

  const handleStatusSave = async (status: 'draft' | 'scheduled' | 'published', scheduledAt: string | null) => {
    if (!selectedTitle) return;
    try {
      await api.put(`/titles/${selectedTitle.id}`, { status, scheduledAt });
      await fetchTitles();
      setShowStatusModal(false);
      setSelectedTitle(null);
    } catch (error) {
      throw error;
    }
  };

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredTitles = titles.filter((title) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      title.topic.toLowerCase().includes(search) ||
      title.style.toLowerCase().includes(search) ||
      title.aiOutput?.toLowerCase().includes(search)
    );
  });

  // Parse AI output to get title variations
  const getTitleVariations = (aiOutput: string): string[] => {
    if (!aiOutput) return [];
    return aiOutput.split('\n').filter((line) => line.trim().length > 0);
  };

  return (
    <PageLayout
      title="Titles"
      subtitle="Create catchy, clickable titles"
      icon="🎯"
      actions={
        <button onClick={() => setShowForm(true)} className="btn-primary">
          + New Title
        </button>
      }
    >
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search titles..."
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

      {/* Titles Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading titles...</div>
      ) : filteredTitles.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-gray-500 mb-4">No titles found. Create your first one!</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            + Create Title
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTitles.map((title) => (
            <ContentCard
              key={title.id}
              id={title.id}
              title={title.topic}
              subtitle={`${title.platform} - ${title.style}`}
              status={title.status || 'draft'}
              scheduledAt={title.scheduledAt}
              createdAt={title.createdAt}
              icon="🎯"
              color="bg-green-100"
              onClick={() => setSelectedTitle(title)}
              onStatusClick={() => {
                setSelectedTitle(title);
                setShowStatusModal(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Detail Modal with A/B Testing Suggestions */}
      {selectedTitle && !showStatusModal && (
        <Modal title="Title Variations" onClose={() => setSelectedTitle(null)}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{selectedTitle.topic}</h3>
              <StatusBadge status={selectedTitle.status || 'draft'} />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Platform:</span>
                <p className="font-medium">{selectedTitle.platform}</p>
              </div>
              <div>
                <span className="text-gray-500">Style:</span>
                <p className="font-medium">{selectedTitle.style}</p>
              </div>
            </div>

            {selectedTitle.aiOutput && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Title Variations (A/B Testing):</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    Click to copy
                  </span>
                </div>
                <div className="space-y-2">
                  {getTitleVariations(selectedTitle.aiOutput).map((variation, idx) => (
                    <div
                      key={idx}
                      onClick={() => copyToClipboard(variation, selectedTitle.id * 100 + idx)}
                      className={`p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors flex items-center justify-between ${
                        copiedId === selectedTitle.id * 100 + idx ? 'bg-green-50 border border-green-200' : ''
                      }`}
                    >
                      <span className="text-sm">{variation}</span>
                      {copiedId === selectedTitle.id * 100 + idx ? (
                        <span className="text-green-600 text-xs">Copied!</span>
                      ) : (
                        <span className="text-gray-400 text-xs">Copy</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4 border-t">
              <button
                onClick={() => handleDelete(selectedTitle.id)}
                className="text-red-600 hover:text-red-800"
              >
                Delete
              </button>
              <div className="flex gap-2">
                <button onClick={() => setShowStatusModal(true)} className="btn-secondary">
                  Change Status
                </button>
                <button onClick={() => setSelectedTitle(null)} className="btn-primary">
                  Close
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Form Modal */}
      {showForm && (
        <Modal title="New Title" onClose={() => setShowForm(false)}>
          <ItemForm feature={feature} onSave={handleSave} onCancel={() => setShowForm(false)} />
        </Modal>
      )}

      {/* Status Modal */}
      {showStatusModal && selectedTitle && (
        <DraftPublishModal
          currentStatus={selectedTitle.status || 'draft'}
          scheduledAt={selectedTitle.scheduledAt}
          onClose={() => {
            setShowStatusModal(false);
            setSelectedTitle(null);
          }}
          onSave={handleStatusSave}
        />
      )}
    </PageLayout>
  );
}
