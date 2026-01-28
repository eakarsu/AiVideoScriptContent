import { useState, useEffect } from 'react';
import PageLayout from '../components/PageLayout';
import ContentCard from '../components/ContentCard';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import ItemForm from '../components/ItemForm';
import DraftPublishModal from '../components/DraftPublishModal';
import { api, getFeatureById } from '../services/api';

interface Hashtag {
  id: number;
  topic: string;
  platform: string;
  niche: string;
  count: number;
  aiOutput: string;
  status: 'draft' | 'scheduled' | 'published';
  scheduledAt: string | null;
  createdAt: string;
}

export default function HashtagsPage() {
  const [hashtags, setHashtags] = useState<Hashtag[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHashtag, setSelectedHashtag] = useState<Hashtag | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);

  const feature = getFeatureById('hashtags')!;

  useEffect(() => {
    fetchHashtags();
  }, [statusFilter]);

  const fetchHashtags = async () => {
    setLoading(true);
    try {
      const endpoint = statusFilter !== 'all' ? `/hashtags?status=${statusFilter}` : '/hashtags';
      const response = await api.get(endpoint);
      setHashtags(response.data);
    } catch (error) {
      console.error('Error fetching hashtags:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: any) => {
    try {
      await api.post('/hashtags', data);
      await fetchHashtags();
      setShowForm(false);
    } catch (error) {
      throw error;
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this hashtag set?')) return;
    try {
      await api.delete(`/hashtags/${id}`);
      await fetchHashtags();
      setSelectedHashtag(null);
    } catch (error) {
      console.error('Error deleting hashtag:', error);
    }
  };

  const handleStatusSave = async (status: 'draft' | 'scheduled' | 'published', scheduledAt: string | null) => {
    if (!selectedHashtag) return;
    try {
      await api.put(`/hashtags/${selectedHashtag.id}`, { status, scheduledAt });
      await fetchHashtags();
      setShowStatusModal(false);
      setSelectedHashtag(null);
    } catch (error) {
      throw error;
    }
  };

  const copyAllHashtags = (text: string) => {
    const hashtags = text.match(/#\w+/g) || [];
    navigator.clipboard.writeText(hashtags.join(' '));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getHashtagsFromOutput = (output: string): string[] => {
    if (!output) return [];
    const matches = output.match(/#\w+/g) || [];
    return [...new Set(matches)];
  };

  const filteredHashtags = hashtags.filter((h) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      h.topic.toLowerCase().includes(search) ||
      h.niche.toLowerCase().includes(search) ||
      h.aiOutput?.toLowerCase().includes(search)
    );
  });

  return (
    <PageLayout
      title="Hashtags"
      subtitle="Find trending hashtags for your content"
      icon="#️⃣"
      actions={
        <button onClick={() => setShowForm(true)} className="btn-primary">
          + New Hashtags
        </button>
      }
    >
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search hashtags..."
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

      {/* Hashtags Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading hashtags...</div>
      ) : filteredHashtags.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-gray-500 mb-4">No hashtags found. Create your first set!</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            + Create Hashtags
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHashtags.map((hashtag) => (
            <ContentCard
              key={hashtag.id}
              id={hashtag.id}
              title={hashtag.topic}
              subtitle={`${hashtag.platform} - ${hashtag.niche}`}
              status={hashtag.status || 'draft'}
              scheduledAt={hashtag.scheduledAt}
              createdAt={hashtag.createdAt}
              icon="#️⃣"
              color="bg-pink-100"
              onClick={() => setSelectedHashtag(hashtag)}
              onStatusClick={() => {
                setSelectedHashtag(hashtag);
                setShowStatusModal(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Detail Modal with Copy-All Feature */}
      {selectedHashtag && !showStatusModal && (
        <Modal title="Hashtag Set" onClose={() => setSelectedHashtag(null)}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{selectedHashtag.topic}</h3>
              <StatusBadge status={selectedHashtag.status || 'draft'} />
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Platform:</span>
                <p className="font-medium">{selectedHashtag.platform}</p>
              </div>
              <div>
                <span className="text-gray-500">Niche:</span>
                <p className="font-medium">{selectedHashtag.niche}</p>
              </div>
              <div>
                <span className="text-gray-500">Count:</span>
                <p className="font-medium">{getHashtagsFromOutput(selectedHashtag.aiOutput).length} hashtags</p>
              </div>
            </div>

            {selectedHashtag.aiOutput && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Generated Hashtags:</span>
                  <button
                    onClick={() => copyAllHashtags(selectedHashtag.aiOutput)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      copied ? 'bg-green-100 text-green-700' : 'bg-pink-100 text-pink-700 hover:bg-pink-200'
                    }`}
                  >
                    {copied ? 'Copied!' : 'Copy All Hashtags'}
                  </button>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex flex-wrap gap-2">
                    {getHashtagsFromOutput(selectedHashtag.aiOutput).map((tag, idx) => (
                      <span
                        key={idx}
                        className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-pink-200"
                        onClick={() => {
                          navigator.clipboard.writeText(tag);
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4 border-t">
              <button onClick={() => handleDelete(selectedHashtag.id)} className="text-red-600 hover:text-red-800">
                Delete
              </button>
              <div className="flex gap-2">
                <button onClick={() => setShowStatusModal(true)} className="btn-secondary">
                  Change Status
                </button>
                <button onClick={() => setSelectedHashtag(null)} className="btn-primary">
                  Close
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Form Modal */}
      {showForm && (
        <Modal title="New Hashtags" onClose={() => setShowForm(false)}>
          <ItemForm feature={feature} onSave={handleSave} onCancel={() => setShowForm(false)} />
        </Modal>
      )}

      {/* Status Modal */}
      {showStatusModal && selectedHashtag && (
        <DraftPublishModal
          currentStatus={selectedHashtag.status || 'draft'}
          scheduledAt={selectedHashtag.scheduledAt}
          onClose={() => {
            setShowStatusModal(false);
            setSelectedHashtag(null);
          }}
          onSave={handleStatusSave}
        />
      )}
    </PageLayout>
  );
}
