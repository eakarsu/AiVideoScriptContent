import { useState, useEffect } from 'react';
import PageLayout from '../components/PageLayout';
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
  const [editingItem, setEditingItem] = useState<Thumbnail | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  const { filters, setFilter } = usePersistedFilters();
  const debouncedSearch = useDebounce(filters.searchTerm, 300);
  const { addToast } = useToast();
  const confirm = useConfirm();
  const feature = getFeatureById('thumbnails')!;

  useEffect(() => {
    fetchThumbnails();
  }, [filters.statusFilter, filters.page, filters.sortBy, debouncedSearch]);

  const fetchThumbnails = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.statusFilter !== 'all') params.set('status', filters.statusFilter);
      params.set('page', String(filters.page));
      params.set('limit', '12');
      const [sortField, sortDir] = filters.sortBy.split('_');
      params.set('sortBy', sortField);
      params.set('sortOrder', sortDir || 'DESC');

      const response = await api.get(`/thumbnails?${params.toString()}`);
      const data = response.data;
      setThumbnails(data.data || data);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      addToast('Failed to load thumbnails', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: any) => {
    try {
      if (editingItem) {
        await api.put(`/thumbnails/${editingItem.id}`, data);
        addToast('Thumbnail updated successfully', 'success');
      } else {
        await api.post('/thumbnails', data);
        addToast('Thumbnail created successfully', 'success');
      }
      await fetchThumbnails();
      setShowForm(false);
      setEditingItem(null);
    } catch (error) {
      addToast('Failed to save thumbnail', 'error');
      throw error;
    }
  };

  const handleDelete = async (id: number) => {
    const ok = await confirm({
      title: 'Delete Thumbnail',
      message: 'Are you sure you want to delete this thumbnail idea? This action cannot be undone.',
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await api.delete(`/thumbnails/${id}`);
      addToast('Thumbnail deleted', 'success');
      await fetchThumbnails();
      setSelectedThumbnail(null);
    } catch (error) {
      addToast('Failed to delete thumbnail', 'error');
    }
  };

  const handleStatusSave = async (status: 'draft' | 'scheduled' | 'published', scheduledAt: string | null) => {
    if (!selectedThumbnail) return;
    try {
      await api.put(`/thumbnails/${selectedThumbnail.id}`, { status, scheduledAt });
      addToast('Status updated', 'success');
      await fetchThumbnails();
      setShowStatusModal(false);
      setSelectedThumbnail(null);
    } catch (error) {
      addToast('Failed to update status', 'error');
      throw error;
    }
  };

  const handleEdit = (item: Thumbnail) => {
    setEditingItem(item);
    setSelectedThumbnail(null);
    setShowForm(true);
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
      await api.post('/thumbnails/bulk-delete', { ids: selectedIds });
      addToast(`${selectedIds.length} thumbnails deleted`, 'success');
      setSelectedIds([]);
      await fetchThumbnails();
    } catch (error) {
      addToast('Failed to delete selected thumbnails', 'error');
    }
  };

  const handleBulkStatus = async (status: 'draft' | 'scheduled' | 'published') => {
    try {
      await api.post('/thumbnails/bulk-status', { ids: selectedIds, status });
      addToast(`${selectedIds.length} thumbnails updated to ${status}`, 'success');
      setSelectedIds([]);
      await fetchThumbnails();
    } catch (error) {
      addToast('Failed to update status', 'error');
    }
  };

  const filteredThumbnails = thumbnails.filter((t) => {
    if (!filters.searchTerm) return true;
    const search = filters.searchTerm.toLowerCase();
    return (
      t.videoTitle.toLowerCase().includes(search) ||
      t.topic.toLowerCase().includes(search) ||
      t.style.toLowerCase().includes(search)
    );
  });

  const exportColumns = [
    { key: 'videoTitle', label: 'Video Title' },
    { key: 'topic', label: 'Topic' },
    { key: 'style', label: 'Style' },
    { key: 'colorScheme', label: 'Color Scheme' },
    { key: 'status', label: 'Status' },
    { key: 'createdAt', label: 'Created' },
  ];

  return (
    <PageLayout
      title="Thumbnails"
      subtitle="Visual thumbnail ideas for your videos"
      icon=""
      actions={
        <div className="flex items-center gap-2">
          <button onClick={() => exportToCSV(filteredThumbnails, 'thumbnails', exportColumns)} className="btn-secondary text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            CSV
          </button>
          <button onClick={() => exportToPDF(filteredThumbnails, 'thumbnails', exportColumns, 'Thumbnails')} className="btn-secondary text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            PDF
          </button>
          <button onClick={() => { setEditingItem(null); setShowForm(true); }} className="btn-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Thumbnail
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
            placeholder="Search thumbnails..."
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

      {/* Thumbnails Grid - Visual Card Layout */}
      {loading ? (
        <CardGridSkeleton count={6} />
      ) : filteredThumbnails.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center" style={{ boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.04)' }}>
          <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 002.25-2.25V5.25a2.25 2.25 0 00-2.25-2.25H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
            </svg>
          </div>
          <p className="text-gray-500 mb-1 font-medium">No thumbnails found</p>
          <p className="text-sm text-gray-400 mb-5">Create your first thumbnail to get started</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create Thumbnail
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredThumbnails.map((thumbnail) => (
              <div
                key={thumbnail.id}
                onClick={() => setSelectedThumbnail(thumbnail)}
                className={`bg-white rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow border border-gray-100 ${
                  selectedIds.includes(thumbnail.id) ? 'ring-2 ring-primary-500' : ''
                }`}
                style={{ boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.04)' }}
              >
                {/* Selection checkbox */}
                {selectedIds.length > 0 && (
                  <div className="absolute top-2 left-2 z-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(thumbnail.id)}
                      onChange={(e) => { e.stopPropagation(); toggleSelect(thumbnail.id); }}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                  </div>
                )}
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
          <Pagination
            page={filters.page}
            totalPages={totalPages}
            onPageChange={(p) => setFilter('page', p)}
          />
        </>
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

            <div className="flex justify-between pt-4 border-t border-gray-100">
              <button
                onClick={() => handleDelete(selectedThumbnail.id)}
                className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
              >
                Delete
              </button>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(selectedThumbnail)} className="btn-secondary text-sm">
                  Edit
                </button>
                <button onClick={() => setShowStatusModal(true)} className="btn-secondary text-sm">
                  Change Status
                </button>
                <button onClick={() => setSelectedThumbnail(null)} className="btn-primary text-sm">
                  Close
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Form Modal */}
      {showForm && (
        <Modal title={editingItem ? 'Edit Thumbnail' : 'New Thumbnail'} onClose={() => { setShowForm(false); setEditingItem(null); }}>
          <ItemForm
            feature={feature}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditingItem(null); }}
            initialData={editingItem || undefined}
          />
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
