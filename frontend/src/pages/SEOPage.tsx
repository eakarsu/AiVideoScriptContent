import { useState, useEffect } from 'react';
import PageLayout from '../components/PageLayout';
import ContentCard from '../components/ContentCard';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import ItemForm from '../components/ItemForm';
import DraftPublishModal from '../components/DraftPublishModal';
import { api, getFeatureById } from '../services/api';

interface SEO {
  id: number;
  videoTitle: string;
  description: string;
  platform: string;
  targetKeywords: string;
  aiOutput: string;
  status: 'draft' | 'scheduled' | 'published';
  scheduledAt: string | null;
  createdAt: string;
}

export default function SEOPage() {
  const [seoItems, setSeoItems] = useState<SEO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeo, setSelectedSeo] = useState<SEO | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);

  const feature = getFeatureById('seo')!;

  useEffect(() => {
    fetchSeoItems();
  }, [statusFilter]);

  const fetchSeoItems = async () => {
    setLoading(true);
    try {
      const endpoint = statusFilter !== 'all' ? `/seo?status=${statusFilter}` : '/seo';
      const response = await api.get(endpoint);
      setSeoItems(response.data);
    } catch (error) {
      console.error('Error fetching SEO items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: any) => {
    try {
      await api.post('/seo', data);
      await fetchSeoItems();
      setShowForm(false);
    } catch (error) {
      throw error;
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this SEO optimization?')) return;
    try {
      await api.delete(`/seo/${id}`);
      await fetchSeoItems();
      setSelectedSeo(null);
    } catch (error) {
      console.error('Error deleting SEO:', error);
    }
  };

  const handleStatusSave = async (status: 'draft' | 'scheduled' | 'published', scheduledAt: string | null) => {
    if (!selectedSeo) return;
    try {
      await api.put(`/seo/${selectedSeo.id}`, { status, scheduledAt });
      await fetchSeoItems();
      setShowStatusModal(false);
      setSelectedSeo(null);
    } catch (error) {
      throw error;
    }
  };

  const extractKeywords = (text: string): string[] => {
    if (!text) return [];
    const keywordMatches = text.match(/keywords?:?\s*([^\n]+)/i);
    if (keywordMatches) {
      return keywordMatches[1].split(/[,;]/).map(k => k.trim()).filter(k => k);
    }
    return [];
  };

  const filteredSeoItems = seoItems.filter((seo) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      seo.videoTitle.toLowerCase().includes(search) ||
      seo.targetKeywords?.toLowerCase().includes(search) ||
      seo.aiOutput?.toLowerCase().includes(search)
    );
  });

  return (
    <PageLayout
      title="SEO"
      subtitle="Keyword optimization and SEO analysis"
      icon="🔍"
      actions={
        <button onClick={() => setShowForm(true)} className="btn-primary">
          + New SEO Analysis
        </button>
      }
    >
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search SEO items..."
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

      {/* SEO Items Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading SEO items...</div>
      ) : filteredSeoItems.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-gray-500 mb-4">No SEO optimizations found. Create your first one!</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            + Create SEO Analysis
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSeoItems.map((seo) => (
            <ContentCard
              key={seo.id}
              id={seo.id}
              title={seo.videoTitle}
              subtitle={seo.platform}
              status={seo.status || 'draft'}
              scheduledAt={seo.scheduledAt}
              createdAt={seo.createdAt}
              icon="🔍"
              color="bg-lime-100"
              onClick={() => setSelectedSeo(seo)}
              onStatusClick={() => {
                setSelectedSeo(seo);
                setShowStatusModal(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedSeo && !showStatusModal && (
        <Modal title="SEO Optimization" onClose={() => setSelectedSeo(null)}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{selectedSeo.videoTitle}</h3>
              <StatusBadge status={selectedSeo.status || 'draft'} />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Platform:</span>
                <p className="font-medium">{selectedSeo.platform}</p>
              </div>
              <div>
                <span className="text-gray-500">Target Keywords:</span>
                <p className="font-medium">{selectedSeo.targetKeywords || 'Not specified'}</p>
              </div>
            </div>

            {/* Keywords Display */}
            {selectedSeo.aiOutput && extractKeywords(selectedSeo.aiOutput).length > 0 && (
              <div>
                <span className="text-sm text-gray-500">Extracted Keywords:</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {extractKeywords(selectedSeo.aiOutput).map((keyword, idx) => (
                    <span
                      key={idx}
                      className="bg-lime-100 text-lime-800 px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-lime-200"
                      onClick={() => navigator.clipboard.writeText(keyword)}
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedSeo.aiOutput && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">SEO Analysis:</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedSeo.aiOutput);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className={`text-xs px-3 py-1 rounded-full ${
                      copied ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {copied ? 'Copied!' : 'Copy All'}
                  </button>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                  <pre className="text-sm whitespace-pre-wrap">{selectedSeo.aiOutput}</pre>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4 border-t">
              <button onClick={() => handleDelete(selectedSeo.id)} className="text-red-600 hover:text-red-800">
                Delete
              </button>
              <div className="flex gap-2">
                <button onClick={() => setShowStatusModal(true)} className="btn-secondary">
                  Change Status
                </button>
                <button onClick={() => setSelectedSeo(null)} className="btn-primary">
                  Close
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Form Modal */}
      {showForm && (
        <Modal title="New SEO Analysis" onClose={() => setShowForm(false)}>
          <ItemForm feature={feature} onSave={handleSave} onCancel={() => setShowForm(false)} />
        </Modal>
      )}

      {/* Status Modal */}
      {showStatusModal && selectedSeo && (
        <DraftPublishModal
          currentStatus={selectedSeo.status || 'draft'}
          scheduledAt={selectedSeo.scheduledAt}
          onClose={() => {
            setShowStatusModal(false);
            setSelectedSeo(null);
          }}
          onSave={handleStatusSave}
        />
      )}
    </PageLayout>
  );
}
