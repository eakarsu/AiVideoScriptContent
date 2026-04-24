import { useState, useEffect } from 'react';
import PageLayout from '../components/PageLayout';
import ContentCard from '../components/ContentCard';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import ItemForm from '../components/ItemForm';
import DraftPublishModal from '../components/DraftPublishModal';
import AIOutputDisplay from '../components/AIOutputDisplay';
import Pagination from '../components/Pagination';
import { CardGridSkeleton } from '../components/Skeleton';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/ConfirmDialog';
import { useDebounce } from '../hooks/useDebounce';
import { usePersistedFilters } from '../hooks/usePersistedFilters';
import { exportToCSV, exportToPDF } from '../utils/export';
import { api, getFeatureById } from '../services/api';

interface Comment {
  id: number;
  originalComment: string;
  context: string;
  tone: string;
  platform: string;
  aiOutput: string;
  status: 'draft' | 'scheduled' | 'published';
  scheduledAt: string | null;
  createdAt: string;
}

export default function CommentsPage() {
  const [items, setItems] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<Comment | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Comment | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  const { filters, setFilter } = usePersistedFilters();
  const debouncedSearch = useDebounce(filters.searchTerm, 300);
  const { addToast } = useToast();
  const confirm = useConfirm();
  const feature = getFeatureById('comments')!;

  useEffect(() => {
    fetchItems();
  }, [filters.statusFilter, filters.page, filters.sortBy, debouncedSearch]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.statusFilter !== 'all') params.set('status', filters.statusFilter);
      params.set('page', String(filters.page));
      params.set('limit', '12');
      const [sortField, sortDir] = filters.sortBy.split('_');
      params.set('sortBy', sortField);
      params.set('sortOrder', sortDir || 'DESC');

      const response = await api.get(`/comments?${params.toString()}`);
      const data = response.data;
      setItems(data.data || data);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      addToast('Failed to load comments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: any) => {
    try {
      if (editingItem) {
        await api.put(`/comments/${editingItem.id}`, data);
        addToast('Comment response updated', 'success');
      } else {
        await api.post('/comments', data);
        addToast('Comment response created', 'success');
      }
      await fetchItems();
      setShowForm(false);
      setEditingItem(null);
    } catch (error) {
      addToast('Failed to save comment response', 'error');
      throw error;
    }
  };

  const handleDelete = async (id: number) => {
    const ok = await confirm({
      title: 'Delete Comment Response',
      message: 'Are you sure you want to delete this comment response? This action cannot be undone.',
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await api.delete(`/comments/${id}`);
      addToast('Comment response deleted', 'success');
      await fetchItems();
      setSelectedItem(null);
    } catch (error) {
      addToast('Failed to delete comment response', 'error');
    }
  };

  const handleStatusSave = async (status: 'draft' | 'scheduled' | 'published', scheduledAt: string | null) => {
    if (!selectedItem) return;
    try {
      await api.put(`/comments/${selectedItem.id}`, { status, scheduledAt });
      addToast('Status updated', 'success');
      await fetchItems();
      setShowStatusModal(false);
      setSelectedItem(null);
    } catch (error) {
      addToast('Failed to update status', 'error');
      throw error;
    }
  };

  const handleEdit = (item: Comment) => {
    setEditingItem(item);
    setSelectedItem(null);
    setShowForm(true);
  };

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
      await api.post('/comments/bulk-delete', { ids: selectedIds });
      addToast(`${selectedIds.length} comments deleted`, 'success');
      setSelectedIds([]);
      await fetchItems();
    } catch (error) {
      addToast('Failed to delete selected comments', 'error');
    }
  };

  const handleBulkStatus = async (status: 'draft' | 'scheduled' | 'published') => {
    try {
      await api.post('/comments/bulk-status', { ids: selectedIds, status });
      addToast(`${selectedIds.length} comments updated to ${status}`, 'success');
      setSelectedIds([]);
      await fetchItems();
    } catch (error) {
      addToast('Failed to update status', 'error');
    }
  };

  const filteredItems = items.filter((item) => {
    if (!filters.searchTerm) return true;
    const search = filters.searchTerm.toLowerCase();
    return (
      item.originalComment?.toLowerCase().includes(search) ||
      item.tone?.toLowerCase().includes(search) ||
      item.platform?.toLowerCase().includes(search) ||
      item.context?.toLowerCase().includes(search)
    );
  });

  const exportColumns = [
    { key: 'originalComment', label: 'Original Comment' },
    { key: 'tone', label: 'Tone' },
    { key: 'platform', label: 'Platform' },
    { key: 'context', label: 'Context' },
    { key: 'status', label: 'Status' },
    { key: 'createdAt', label: 'Created' },
  ];

  return (
    <PageLayout
      title="Comment Responder"
      subtitle="AI-powered reply suggestions"
      icon=""
      actions={
        <div className="flex items-center gap-2">
          <button onClick={() => exportToCSV(filteredItems, 'comments', exportColumns)} className="btn-secondary text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            CSV
          </button>
          <button onClick={() => exportToPDF(filteredItems, 'comments', exportColumns, 'Comment Responses')} className="btn-secondary text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            PDF
          </button>
          <button onClick={() => { setEditingItem(null); setShowForm(true); }} className="btn-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Response
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
            placeholder="Search comments..."
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

      {/* Items Grid */}
      {loading ? (
        <CardGridSkeleton count={6} />
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center" style={{ boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.04)' }}>
          <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
          </div>
          <p className="text-gray-500 mb-1 font-medium">No comment responses found</p>
          <p className="text-sm text-gray-400 mb-5">Generate your first AI reply</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Response
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <ContentCard
                key={item.id}
                id={item.id}
                title={item.originalComment?.substring(0, 60) + (item.originalComment?.length > 60 ? '...' : '')}
                subtitle={`${item.platform} - ${item.tone}`}
                status={item.status || 'draft'}
                scheduledAt={item.scheduledAt}
                createdAt={item.createdAt}
                icon=""
                color="bg-teal-50"
                onClick={() => setSelectedItem(item)}
                onStatusClick={() => {
                  setSelectedItem(item);
                  setShowStatusModal(true);
                }}
                selected={selectedIds.includes(item.id)}
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
      {selectedItem && !showStatusModal && (
        <Modal title="Comment Response Details" onClose={() => setSelectedItem(null)}>
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Comment Response</h3>
              <StatusBadge status={selectedItem.status || 'draft'} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Tone', value: selectedItem.tone },
                { label: 'Platform', value: selectedItem.platform },
              ].map((field) => (
                <div key={field.label} className="bg-gray-50 rounded-xl p-3">
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{field.label}</span>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">{field.value || '-'}</p>
                </div>
              ))}
            </div>

            <div>
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Original Comment</span>
              <div className="mt-2 bg-gray-50 rounded-xl p-3">
                <p className="text-sm text-gray-900">{selectedItem.originalComment}</p>
              </div>
            </div>

            {selectedItem.context && (
              <div>
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Context</span>
                <div className="mt-2 bg-gray-50 rounded-xl p-3">
                  <p className="text-sm text-gray-900">{selectedItem.context}</p>
                </div>
              </div>
            )}

            {selectedItem.aiOutput && (
              <AIOutputDisplay content={selectedItem.aiOutput} title="AI Response Suggestion" />
            )}

            <div className="flex justify-between pt-4 border-t border-gray-100">
              <button
                onClick={() => handleDelete(selectedItem.id)}
                className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
              >
                Delete
              </button>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(selectedItem)} className="btn-secondary text-sm">Edit</button>
                <button onClick={() => setShowStatusModal(true)} className="btn-secondary text-sm">Change Status</button>
                <button onClick={() => setSelectedItem(null)} className="btn-primary text-sm">Close</button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Form Modal */}
      {showForm && (
        <Modal title={editingItem ? 'Edit Comment Response' : 'New Comment Response'} onClose={() => { setShowForm(false); setEditingItem(null); }}>
          <ItemForm
            feature={feature}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditingItem(null); }}
            initialData={editingItem || undefined}
          />
        </Modal>
      )}

      {/* Status Modal */}
      {showStatusModal && selectedItem && (
        <DraftPublishModal
          currentStatus={selectedItem.status || 'draft'}
          scheduledAt={selectedItem.scheduledAt}
          onClose={() => { setShowStatusModal(false); setSelectedItem(null); }}
          onSave={handleStatusSave}
        />
      )}
    </PageLayout>
  );
}
