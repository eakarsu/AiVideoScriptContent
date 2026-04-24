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
  const [editingItem, setEditingItem] = useState<Hashtag | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [copied, setCopied] = useState(false);

  const { filters, setFilter } = usePersistedFilters();
  const debouncedSearch = useDebounce(filters.searchTerm, 300);
  const { addToast } = useToast();
  const confirm = useConfirm();
  const feature = getFeatureById('hashtags')!;

  useEffect(() => {
    fetchHashtags();
  }, [filters.statusFilter, filters.page, filters.sortBy, debouncedSearch]);

  const fetchHashtags = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.statusFilter !== 'all') params.set('status', filters.statusFilter);
      params.set('page', String(filters.page));
      params.set('limit', '12');
      const [sortField, sortDir] = filters.sortBy.split('_');
      params.set('sortBy', sortField);
      params.set('sortOrder', sortDir || 'DESC');

      const response = await api.get(`/hashtags?${params.toString()}`);
      const data = response.data;
      setHashtags(data.data || data);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      addToast('Failed to load hashtags', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: any) => {
    try {
      if (editingItem) {
        await api.put(`/hashtags/${editingItem.id}`, data);
        addToast('Hashtag set updated successfully', 'success');
      } else {
        await api.post('/hashtags', data);
        addToast('Hashtag set created successfully', 'success');
      }
      await fetchHashtags();
      setShowForm(false);
      setEditingItem(null);
    } catch (error) {
      addToast('Failed to save hashtags', 'error');
      throw error;
    }
  };

  const handleDelete = async (id: number) => {
    const ok = await confirm({
      title: 'Delete Hashtag Set',
      message: 'Are you sure you want to delete this hashtag set? This action cannot be undone.',
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await api.delete(`/hashtags/${id}`);
      addToast('Hashtag set deleted', 'success');
      await fetchHashtags();
      setSelectedHashtag(null);
    } catch (error) {
      addToast('Failed to delete hashtag set', 'error');
    }
  };

  const handleStatusSave = async (status: 'draft' | 'scheduled' | 'published', scheduledAt: string | null) => {
    if (!selectedHashtag) return;
    try {
      await api.put(`/hashtags/${selectedHashtag.id}`, { status, scheduledAt });
      addToast('Status updated', 'success');
      await fetchHashtags();
      setShowStatusModal(false);
      setSelectedHashtag(null);
    } catch (error) {
      addToast('Failed to update status', 'error');
      throw error;
    }
  };

  const handleEdit = (item: Hashtag) => {
    setEditingItem(item);
    setSelectedHashtag(null);
    setShowForm(true);
  };

  const copyAllHashtags = (text: string) => {
    const tags = text.match(/#\w+/g) || [];
    navigator.clipboard.writeText(tags.join(' '));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getHashtagsFromOutput = (output: string): string[] => {
    if (!output) return [];
    const matches = output.match(/#\w+/g) || [];
    return [...new Set(matches)];
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
      await api.post('/hashtags/bulk-delete', { ids: selectedIds });
      addToast(`${selectedIds.length} hashtag sets deleted`, 'success');
      setSelectedIds([]);
      await fetchHashtags();
    } catch (error) {
      addToast('Failed to delete selected hashtag sets', 'error');
    }
  };

  const handleBulkStatus = async (status: 'draft' | 'scheduled' | 'published') => {
    try {
      await api.post('/hashtags/bulk-status', { ids: selectedIds, status });
      addToast(`${selectedIds.length} hashtag sets updated to ${status}`, 'success');
      setSelectedIds([]);
      await fetchHashtags();
    } catch (error) {
      addToast('Failed to update status', 'error');
    }
  };

  const filteredHashtags = hashtags.filter((h) => {
    if (!filters.searchTerm) return true;
    const search = filters.searchTerm.toLowerCase();
    return (
      h.topic.toLowerCase().includes(search) ||
      h.niche.toLowerCase().includes(search) ||
      h.aiOutput?.toLowerCase().includes(search)
    );
  });

  const exportColumns = [
    { key: 'topic', label: 'Topic' },
    { key: 'platform', label: 'Platform' },
    { key: 'niche', label: 'Niche' },
    { key: 'count', label: 'Count' },
    { key: 'status', label: 'Status' },
    { key: 'createdAt', label: 'Created' },
  ];

  return (
    <PageLayout
      title="Hashtags"
      subtitle="Find trending hashtags for your content"
      icon=""
      actions={
        <div className="flex items-center gap-2">
          <button onClick={() => exportToCSV(filteredHashtags, 'hashtags', exportColumns)} className="btn-secondary text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            CSV
          </button>
          <button onClick={() => exportToPDF(filteredHashtags, 'hashtags', exportColumns, 'Hashtags')} className="btn-secondary text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            PDF
          </button>
          <button onClick={() => { setEditingItem(null); setShowForm(true); }} className="btn-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Hashtags
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
            placeholder="Search hashtags..."
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

      {/* Hashtags Grid */}
      {loading ? (
        <CardGridSkeleton count={6} />
      ) : filteredHashtags.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center" style={{ boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.04)' }}>
          <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <p className="text-gray-500 mb-1 font-medium">No hashtags found</p>
          <p className="text-sm text-gray-400 mb-5">Create your first hashtag set to get started</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create Hashtags
          </button>
        </div>
      ) : (
        <>
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
                icon=""
                color="bg-pink-50"
                onClick={() => setSelectedHashtag(hashtag)}
                onStatusClick={() => {
                  setSelectedHashtag(hashtag);
                  setShowStatusModal(true);
                }}
                selected={selectedIds.includes(hashtag.id)}
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

            <div className="flex justify-between pt-4 border-t border-gray-100">
              <button
                onClick={() => handleDelete(selectedHashtag.id)}
                className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
              >
                Delete
              </button>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(selectedHashtag)} className="btn-secondary text-sm">
                  Edit
                </button>
                <button onClick={() => setShowStatusModal(true)} className="btn-secondary text-sm">
                  Change Status
                </button>
                <button onClick={() => setSelectedHashtag(null)} className="btn-primary text-sm">
                  Close
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Form Modal */}
      {showForm && (
        <Modal title={editingItem ? 'Edit Hashtags' : 'New Hashtags'} onClose={() => { setShowForm(false); setEditingItem(null); }}>
          <ItemForm
            feature={feature}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditingItem(null); }}
            initialData={editingItem || undefined}
          />
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
