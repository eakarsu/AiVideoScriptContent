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
  const [editingItem, setEditingItem] = useState<SEO | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [copied, setCopied] = useState(false);

  const { filters, setFilter } = usePersistedFilters();
  const debouncedSearch = useDebounce(filters.searchTerm, 300);
  const { addToast } = useToast();
  const confirm = useConfirm();
  const feature = getFeatureById('seo')!;

  useEffect(() => {
    fetchSeoItems();
  }, [filters.statusFilter, filters.page, filters.sortBy, debouncedSearch]);

  const fetchSeoItems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.statusFilter !== 'all') params.set('status', filters.statusFilter);
      params.set('page', String(filters.page));
      params.set('limit', '12');
      const [sortField, sortDir] = filters.sortBy.split('_');
      params.set('sortBy', sortField);
      params.set('sortOrder', sortDir || 'DESC');

      const response = await api.get(`/seo?${params.toString()}`);
      const data = response.data;
      setSeoItems(data.data || data);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      addToast('Failed to load SEO items', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: any) => {
    try {
      if (editingItem) {
        await api.put(`/seo/${editingItem.id}`, data);
        addToast('SEO analysis updated successfully', 'success');
      } else {
        await api.post('/seo', data);
        addToast('SEO analysis created successfully', 'success');
      }
      await fetchSeoItems();
      setShowForm(false);
      setEditingItem(null);
    } catch (error) {
      addToast('Failed to save SEO analysis', 'error');
      throw error;
    }
  };

  const handleDelete = async (id: number) => {
    const ok = await confirm({
      title: 'Delete SEO Analysis',
      message: 'Are you sure you want to delete this SEO optimization? This action cannot be undone.',
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await api.delete(`/seo/${id}`);
      addToast('SEO analysis deleted', 'success');
      await fetchSeoItems();
      setSelectedSeo(null);
    } catch (error) {
      addToast('Failed to delete SEO analysis', 'error');
    }
  };

  const handleStatusSave = async (status: 'draft' | 'scheduled' | 'published', scheduledAt: string | null) => {
    if (!selectedSeo) return;
    try {
      await api.put(`/seo/${selectedSeo.id}`, { status, scheduledAt });
      addToast('Status updated', 'success');
      await fetchSeoItems();
      setShowStatusModal(false);
      setSelectedSeo(null);
    } catch (error) {
      addToast('Failed to update status', 'error');
      throw error;
    }
  };

  const handleEdit = (item: SEO) => {
    setEditingItem(item);
    setSelectedSeo(null);
    setShowForm(true);
  };

  const extractKeywords = (text: string): string[] => {
    if (!text) return [];
    const keywordMatches = text.match(/keywords?:?\s*([^\n]+)/i);
    if (keywordMatches) {
      return keywordMatches[1].split(/[,;]/).map(k => k.trim()).filter(k => k);
    }
    return [];
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
      await api.post('/seo/bulk-delete', { ids: selectedIds });
      addToast(`${selectedIds.length} SEO analyses deleted`, 'success');
      setSelectedIds([]);
      await fetchSeoItems();
    } catch (error) {
      addToast('Failed to delete selected SEO analyses', 'error');
    }
  };

  const handleBulkStatus = async (status: 'draft' | 'scheduled' | 'published') => {
    try {
      await api.post('/seo/bulk-status', { ids: selectedIds, status });
      addToast(`${selectedIds.length} SEO analyses updated to ${status}`, 'success');
      setSelectedIds([]);
      await fetchSeoItems();
    } catch (error) {
      addToast('Failed to update status', 'error');
    }
  };

  const filteredSeoItems = seoItems.filter((seo) => {
    if (!filters.searchTerm) return true;
    const search = filters.searchTerm.toLowerCase();
    return (
      seo.videoTitle.toLowerCase().includes(search) ||
      seo.targetKeywords?.toLowerCase().includes(search) ||
      seo.aiOutput?.toLowerCase().includes(search)
    );
  });

  const exportColumns = [
    { key: 'videoTitle', label: 'Video Title' },
    { key: 'platform', label: 'Platform' },
    { key: 'targetKeywords', label: 'Target Keywords' },
    { key: 'status', label: 'Status' },
    { key: 'createdAt', label: 'Created' },
  ];

  return (
    <PageLayout
      title="SEO"
      subtitle="Keyword optimization and SEO analysis"
      icon=""
      actions={
        <div className="flex items-center gap-2">
          <button onClick={() => exportToCSV(filteredSeoItems, 'seo', exportColumns)} className="btn-secondary text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            CSV
          </button>
          <button onClick={() => exportToPDF(filteredSeoItems, 'seo', exportColumns, 'SEO Analysis')} className="btn-secondary text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            PDF
          </button>
          <button onClick={() => { setEditingItem(null); setShowForm(true); }} className="btn-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New SEO Analysis
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
            placeholder="Search SEO items..."
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

      {/* SEO Items Grid */}
      {loading ? (
        <CardGridSkeleton count={6} />
      ) : filteredSeoItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center" style={{ boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.04)' }}>
          <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <p className="text-gray-500 mb-1 font-medium">No SEO optimizations found</p>
          <p className="text-sm text-gray-400 mb-5">Create your first SEO analysis to get started</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create SEO Analysis
          </button>
        </div>
      ) : (
        <>
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
                icon=""
                color="bg-lime-50"
                onClick={() => setSelectedSeo(seo)}
                onStatusClick={() => {
                  setSelectedSeo(seo);
                  setShowStatusModal(true);
                }}
                selected={selectedIds.includes(seo.id)}
                onSelect={toggleSelect}
                selectionMode={selectedIds.length > 0}
              />
            ))}
          </div>
          <Pagination
            page={filters.page}
            totalPages={totalPages}
            onPageChange={(p) => setFilter('page', p)}
          />
        </>
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

            <div className="flex justify-between pt-4 border-t border-gray-100">
              <button
                onClick={() => handleDelete(selectedSeo.id)}
                className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
              >
                Delete
              </button>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(selectedSeo)} className="btn-secondary text-sm">
                  Edit
                </button>
                <button onClick={() => setShowStatusModal(true)} className="btn-secondary text-sm">
                  Change Status
                </button>
                <button onClick={() => setSelectedSeo(null)} className="btn-primary text-sm">
                  Close
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Form Modal */}
      {showForm && (
        <Modal title={editingItem ? 'Edit SEO Analysis' : 'New SEO Analysis'} onClose={() => { setShowForm(false); setEditingItem(null); }}>
          <ItemForm
            feature={feature}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditingItem(null); }}
            initialData={editingItem || undefined}
          />
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
