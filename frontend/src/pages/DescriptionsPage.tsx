import { useState, useEffect } from 'react';
import PageLayout from '../components/PageLayout';
import ContentCard from '../components/ContentCard';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import ItemForm from '../components/ItemForm';
import DraftPublishModal from '../components/DraftPublishModal';
import Pagination from '../components/Pagination';
import { CardGridSkeleton } from '../components/Skeleton';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/ConfirmDialog';
import { useDebounce } from '../hooks/useDebounce';
import { usePersistedFilters } from '../hooks/usePersistedFilters';
import { exportToCSV, exportToPDF } from '../utils/export';
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
  const [editingItem, setEditingItem] = useState<Description | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [copied, setCopied] = useState(false);

  const { filters, setFilter } = usePersistedFilters();
  const debouncedSearch = useDebounce(filters.searchTerm, 300);
  const { addToast } = useToast();
  const confirm = useConfirm();
  const feature = getFeatureById('descriptions')!;

  useEffect(() => {
    fetchDescriptions();
  }, [filters.statusFilter, filters.page, filters.sortBy, debouncedSearch]);

  const fetchDescriptions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.statusFilter !== 'all') params.set('status', filters.statusFilter);
      params.set('page', String(filters.page));
      params.set('limit', '12');
      const [sortField, sortDir] = filters.sortBy.split('_');
      params.set('sortBy', sortField);
      params.set('sortOrder', sortDir || 'DESC');

      const response = await api.get(`/descriptions?${params.toString()}`);
      const data = response.data;
      setDescriptions(data.data || data);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      addToast('Failed to load descriptions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: any) => {
    try {
      if (editingItem) {
        await api.put(`/descriptions/${editingItem.id}`, data);
        addToast('Description updated successfully', 'success');
      } else {
        await api.post('/descriptions', data);
        addToast('Description created successfully', 'success');
      }
      await fetchDescriptions();
      setShowForm(false);
      setEditingItem(null);
    } catch (error) {
      addToast('Failed to save description', 'error');
      throw error;
    }
  };

  const handleDelete = async (id: number) => {
    const ok = await confirm({
      title: 'Delete Description',
      message: 'Are you sure you want to delete this description? This action cannot be undone.',
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await api.delete(`/descriptions/${id}`);
      addToast('Description deleted', 'success');
      await fetchDescriptions();
      setSelectedDesc(null);
    } catch (error) {
      addToast('Failed to delete description', 'error');
    }
  };

  const handleStatusSave = async (status: 'draft' | 'scheduled' | 'published', scheduledAt: string | null) => {
    if (!selectedDesc) return;
    try {
      await api.put(`/descriptions/${selectedDesc.id}`, { status, scheduledAt });
      addToast('Status updated', 'success');
      await fetchDescriptions();
      setShowStatusModal(false);
      setSelectedDesc(null);
    } catch (error) {
      addToast('Failed to update status', 'error');
      throw error;
    }
  };

  const handleEdit = (item: Description) => {
    setEditingItem(item);
    setSelectedDesc(null);
    setShowForm(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Bulk operations
  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  const handleBulkDelete = async () => {
    const ok = await confirm({
      title: 'Delete Selected',
      message: `Are you sure you want to delete ${selectedIds.length} items?`,
      confirmLabel: 'Delete All',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await api.post('/descriptions/bulk-delete', { ids: selectedIds });
      addToast(`${selectedIds.length} descriptions deleted`, 'success');
      setSelectedIds([]);
      await fetchDescriptions();
    } catch (error) {
      addToast('Failed to delete selected descriptions', 'error');
    }
  };

  const handleBulkStatus = async (status: 'draft' | 'scheduled' | 'published') => {
    try {
      await api.post('/descriptions/bulk-status', { ids: selectedIds, status });
      addToast(`${selectedIds.length} descriptions updated to ${status}`, 'success');
      setSelectedIds([]);
      await fetchDescriptions();
    } catch (error) {
      addToast('Failed to update status', 'error');
    }
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
    if (!filters.searchTerm) return true;
    const search = filters.searchTerm.toLowerCase();
    return (
      desc.videoTitle.toLowerCase().includes(search) ||
      desc.topic.toLowerCase().includes(search)
    );
  });

  const exportColumns = [
    { key: 'videoTitle', label: 'Video Title' },
    { key: 'topic', label: 'Topic' },
    { key: 'platform', label: 'Platform' },
    { key: 'status', label: 'Status' },
    { key: 'createdAt', label: 'Created' },
  ];

  return (
    <PageLayout
      title="Descriptions"
      subtitle="SEO-optimized video descriptions"
      icon=""
      actions={
        <div className="flex items-center gap-2">
          <button onClick={() => exportToCSV(filteredDescriptions, 'descriptions', exportColumns)} className="btn-secondary text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            CSV
          </button>
          <button onClick={() => exportToPDF(filteredDescriptions, 'descriptions', exportColumns, 'Descriptions')} className="btn-secondary text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            PDF
          </button>
          <button onClick={() => { setEditingItem(null); setShowForm(true); }} className="btn-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Description
          </button>
        </div>
      }
    >
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Search descriptions..."
            value={filters.searchTerm}
            onChange={(e) => setFilter('searchTerm', e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <select
          value={filters.sortBy}
          onChange={(e) => setFilter('sortBy', e.target.value)}
          className="input-field w-auto min-w-[160px]"
        >
          <option value="createdAt_DESC">Newest first</option>
          <option value="createdAt_ASC">Oldest first</option>
          <option value="title_ASC">Title A-Z</option>
          <option value="title_DESC">Title Z-A</option>
        </select>
        <div className="flex gap-1.5 bg-white border border-gray-200 rounded-xl p-1">
          {['all', 'draft', 'scheduled', 'published'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter('statusFilter', status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filters.statusFilter === status
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 bg-primary-50 border border-primary-200 rounded-xl">
          <span className="text-sm font-medium text-primary-700">{selectedIds.length} selected</span>
          <button onClick={handleBulkDelete} className="text-sm font-medium text-red-600 hover:text-red-700">Delete Selected</button>
          <button onClick={() => handleBulkStatus('draft')} className="text-sm font-medium text-gray-600 hover:text-gray-700">Set Draft</button>
          <button onClick={() => handleBulkStatus('published')} className="text-sm font-medium text-emerald-600 hover:text-emerald-700">Set Published</button>
          <button onClick={() => setSelectedIds([])} className="ml-auto text-sm text-gray-500 hover:text-gray-700">Clear</button>
        </div>
      )}

      {/* Descriptions Grid */}
      {loading ? (
        <CardGridSkeleton count={6} />
      ) : filteredDescriptions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center" style={{ boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.04)' }}>
          <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <p className="text-gray-500 mb-1 font-medium">No descriptions found</p>
          <p className="text-sm text-gray-400 mb-5">Create your first description to get started</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create Description
          </button>
        </div>
      ) : (
        <>
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
                  icon=""
                  color="bg-purple-50"
                  onClick={() => setSelectedDesc(desc)}
                  onStatusClick={() => {
                    setSelectedDesc(desc);
                    setShowStatusModal(true);
                  }}
                  selected={selectedIds.includes(desc.id)}
                  onSelect={toggleSelect}
                  selectionMode={selectedIds.length > 0}
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
          <Pagination
            page={filters.page}
            totalPages={totalPages}
            onPageChange={(p) => setFilter('page', p)}
          />
        </>
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

            <div className="flex justify-between pt-4 border-t border-gray-100">
              <button
                onClick={() => handleDelete(selectedDesc.id)}
                className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
              >
                Delete
              </button>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(selectedDesc)} className="btn-secondary text-sm">
                  Edit
                </button>
                <button onClick={() => setShowStatusModal(true)} className="btn-secondary text-sm">
                  Change Status
                </button>
                <button onClick={() => setSelectedDesc(null)} className="btn-primary text-sm">
                  Close
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Form Modal */}
      {showForm && (
        <Modal title={editingItem ? 'Edit Description' : 'New Description'} onClose={() => { setShowForm(false); setEditingItem(null); }}>
          <ItemForm
            feature={feature}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditingItem(null); }}
            initialData={editingItem || undefined}
          />
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
