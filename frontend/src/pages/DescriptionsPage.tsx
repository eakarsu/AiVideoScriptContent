import { useState, useEffect } from 'react';
import PageLayout from '../components/PageLayout';
import ContentCard from '../components/ContentCard';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import ItemForm from '../components/ItemForm';
import DraftPublishModal from '../components/DraftPublishModal';
import { api, getFeatureById } from '../services/api';

interface Description {
  id: number;
  videoTitle: string;
  topic: string;
  platform: string;
  includeLinks: boolean;
  includeCta: boolean;
  aiOutput: string;
  status: 'draft' | 'scheduled' | 'published';
  scheduledAt: string | null;
  createdAt: string;
}

export default function DescriptionsPage() {
  const [descriptions, setDescriptions] = useState<Description[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDesc, setSelectedDesc] = useState<Description | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);

  const feature = getFeatureById('descriptions')!;

  useEffect(() => {
    fetchDescriptions();
  }, [statusFilter]);

  const fetchDescriptions = async () => {
    setLoading(true);
    try {
      const endpoint = statusFilter !== 'all' ? `/descriptions?status=${statusFilter}` : '/descriptions';
      const response = await api.get(endpoint);
      setDescriptions(response.data);
    } catch (error) {
      console.error('Error fetching descriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: any) => {
    try {
      await api.post('/descriptions', data);
      await fetchDescriptions();
      setShowForm(false);
    } catch (error) {
      throw error;
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this description?')) return;
    try {
      await api.delete(`/descriptions/${id}`);
      await fetchDescriptions();
      setSelectedDesc(null);
    } catch (error) {
      console.error('Error deleting description:', error);
    }
  };

  const handleStatusSave = async (status: 'draft' | 'scheduled' | 'published', scheduledAt: string | null) => {
    if (!selectedDesc) return;
    try {
      await api.put(`/descriptions/${selectedDesc.id}`, { status, scheduledAt });
      await fetchDescriptions();
      setShowStatusModal(false);
      setSelectedDesc(null);
    } catch (error) {
      throw error;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple SEO score calculation
  const calculateSeoScore = (text: string): number => {
    if (!text) return 0;
    let score = 0;
    if (text.length > 100) score += 20;
    if (text.length > 300) score += 20;
    if (text.includes('#')) score += 15;
    if (text.match(/https?:\/\//)) score += 15;
    if (text.toLowerCase().includes('subscribe')) score += 10;
    if (text.toLowerCase().includes('like')) score += 10;
    if (text.split('\n').length > 3) score += 10;
    return Math.min(score, 100);
  };

  const filteredDescriptions = descriptions.filter((desc) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      desc.videoTitle.toLowerCase().includes(search) ||
      desc.topic.toLowerCase().includes(search)
    );
  });

  return (
    <PageLayout
      title="Descriptions"
      subtitle="SEO-optimized video descriptions"
      icon="📄"
      actions={
        <button onClick={() => setShowForm(true)} className="btn-primary">
          + New Description
        </button>
      }
    >
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search descriptions..."
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

      {/* Descriptions Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading descriptions...</div>
      ) : filteredDescriptions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-gray-500 mb-4">No descriptions found. Create your first one!</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            + Create Description
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDescriptions.map((desc) => (
            <div key={desc.id} className="relative">
              <ContentCard
                id={desc.id}
                title={desc.videoTitle}
                subtitle={`${desc.platform} - ${desc.topic}`}
                status={desc.status || 'draft'}
                scheduledAt={desc.scheduledAt}
                createdAt={desc.createdAt}
                icon="📄"
                color="bg-purple-100"
                onClick={() => setSelectedDesc(desc)}
                onStatusClick={() => {
                  setSelectedDesc(desc);
                  setShowStatusModal(true);
                }}
              />
              {/* SEO Score Badge */}
              <div className="absolute top-2 right-12">
                <div
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    calculateSeoScore(desc.aiOutput) >= 70
                      ? 'bg-green-100 text-green-700'
                      : calculateSeoScore(desc.aiOutput) >= 40
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  SEO: {calculateSeoScore(desc.aiOutput)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal with SEO Score */}
      {selectedDesc && !showStatusModal && (
        <Modal title="Description Details" onClose={() => setSelectedDesc(null)}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{selectedDesc.videoTitle}</h3>
              <StatusBadge status={selectedDesc.status || 'draft'} />
            </div>

            {/* SEO Score */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">SEO Score</span>
                <span
                  className={`text-lg font-bold ${
                    calculateSeoScore(selectedDesc.aiOutput) >= 70
                      ? 'text-green-600'
                      : calculateSeoScore(selectedDesc.aiOutput) >= 40
                      ? 'text-yellow-600'
                      : 'text-red-600'
                  }`}
                >
                  {calculateSeoScore(selectedDesc.aiOutput)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    calculateSeoScore(selectedDesc.aiOutput) >= 70
                      ? 'bg-green-500'
                      : calculateSeoScore(selectedDesc.aiOutput) >= 40
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${calculateSeoScore(selectedDesc.aiOutput)}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Platform:</span>
                <p className="font-medium">{selectedDesc.platform}</p>
              </div>
              <div>
                <span className="text-gray-500">Topic:</span>
                <p className="font-medium">{selectedDesc.topic}</p>
              </div>
            </div>

            {selectedDesc.aiOutput && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Generated Description:</span>
                  <button
                    onClick={() => copyToClipboard(selectedDesc.aiOutput)}
                    className={`text-xs px-3 py-1 rounded-full ${
                      copied ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {copied ? 'Copied!' : 'Copy All'}
                  </button>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                  <pre className="text-sm whitespace-pre-wrap">{selectedDesc.aiOutput}</pre>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4 border-t">
              <button onClick={() => handleDelete(selectedDesc.id)} className="text-red-600 hover:text-red-800">
                Delete
              </button>
              <div className="flex gap-2">
                <button onClick={() => setShowStatusModal(true)} className="btn-secondary">
                  Change Status
                </button>
                <button onClick={() => setSelectedDesc(null)} className="btn-primary">
                  Close
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Form Modal */}
      {showForm && (
        <Modal title="New Description" onClose={() => setShowForm(false)}>
          <ItemForm feature={feature} onSave={handleSave} onCancel={() => setShowForm(false)} />
        </Modal>
      )}

      {/* Status Modal */}
      {showStatusModal && selectedDesc && (
        <DraftPublishModal
          currentStatus={selectedDesc.status || 'draft'}
          scheduledAt={selectedDesc.scheduledAt}
          onClose={() => {
            setShowStatusModal(false);
            setSelectedDesc(null);
          }}
          onSave={handleStatusSave}
        />
      )}
    </PageLayout>
  );
}
