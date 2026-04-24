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

interface Trend {
  id: number;
  niche: string;
  platform: string;
  timeframe: string;
  region: string;
  aiOutput: string;
  status: 'draft' | 'scheduled' | 'published';
  scheduledAt: string | null;
  createdAt: string;
}

export default function TrendsPage() {
  const [trends, setTrends] = useState<Trend[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrend, setSelectedTrend] = useState<Trend | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Trend | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  const { filters, setFilter } = usePersistedFilters();
  const debouncedSearch = useDebounce(filters.searchTerm, 300);
  const { addToast } = useToast();
  const confirm = useConfirm();
  const feature = getFeatureById('trends')!;

  useEffect(() => {
    fetchTrends();
  }, [filters.statusFilter, filters.page, filters.sortBy, debouncedSearch]);

  const fetchTrends = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.statusFilter !== 'all') params.set('status', filters.statusFilter);
      params.set('page', String(filters.page));
      params.set('limit', '12');
      const [sortField, sortDir] = filters.sortBy.split('_');
      params.set('sortBy', sortField);
      params.set('sortOrder', sortDir || 'DESC');

      const response = await api.get(`/trends?${params.toString()}`);
      const data = response.data;
      setTrends(data.data || data);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      addToast('Failed to load trends', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: any) => {
    try {
      if (editingItem) {
        await api.put(`/trends/${editingItem.id}`, data);
        addToast('Trend analysis updated successfully', 'success');
      } else {
        await api.post('/trends', data);
        addToast('Trend analysis created successfully', 'success');
      }
      await fetchTrends();
      setShowForm(false);
      setEditingItem(null);
    } catch (error) {
      addToast('Failed to save trend analysis', 'error');
      throw error;
    }
  };

  const handleDelete = async (id: number) => {
    const ok = await confirm({
      title: 'Delete Trend Analysis',
      message: 'Are you sure you want to delete this trend analysis? This action cannot be undone.',
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await api.delete(`/trends/${id}`);
      addToast('Trend analysis deleted', 'success');
      await fetchTrends();
      setSelectedTrend(null);
    } catch (error) {
      addToast('Failed to delete trend analysis', 'error');
    }
  };

  const handleStatusSave = async (status: 'draft' | 'scheduled' | 'published', scheduledAt: string | null) => {
    if (!selectedTrend) return;
    try {
      await api.put(`/trends/${selectedTrend.id}`, { status, scheduledAt });
      addToast('Status updated', 'success');
      await fetchTrends();
      setShowStatusModal(false);
      setSelectedTrend(null);
    } catch (error) {
      addToast('Failed to update status', 'error');
      throw error;
    }
  };

  const handleEdit = (item: Trend) => {
    setEditingItem(item);
    setSelectedTrend(null);
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
      await api.post('/trends/bulk-delete', { ids: selectedIds });
      addToast(`${selectedIds.length} trend analyses deleted`, 'success');
      setSelectedIds([]);
      await fetchTrends();
    } catch (error) {
      addToast('Failed to delete selected trend analyses', 'error');
    }
  };

  const handleBulkStatus = async (status: 'draft' | 'scheduled' | 'published') => {
    try {
      await api.post('/trends/bulk-status', { ids: selectedIds, status });
      addToast(`${selectedIds.length} trend analyses updated to ${status}`, 'success');
      setSelectedIds([]);
      await fetchTrends();
    } catch (error) {
      addToast('Failed to update status', 'error');
    }
  };

  const filteredTrends = trends.filter((trend) => {
    if (!filters.searchTerm) return true;
    const search = filters.searchTerm.toLowerCase();
    return (
      trend.niche.toLowerCase().includes(search) ||
      trend.platform.toLowerCase().includes(search) ||
      trend.aiOutput?.toLowerCase().includes(search)
    );
  });

  const exportColumns = [
    { key: 'niche', label: 'Niche' },
    { key: 'platform', label: 'Platform' },
    { key: 'timeframe', label: 'Timeframe' },
    { key: 'region', label: 'Region' },
    { key: 'status', label: 'Status' },
    { key: 'createdAt', label: 'Created' },
  ];

  return (
    <PageLayout
      title="Trends"
      subtitle="Analyze current trends in your niche"
      icon=""
      actions={
        <div className="flex items-center gap-2">
          <button onClick={() => exportToCSV(filteredTrends, 'trends', exportColumns)} className="btn-secondary text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            CSV
          </button>
          <button onClick={() => exportToPDF(filteredTrends, 'trends', exportColumns, 'Trends')} className="btn-secondary text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            PDF
          </button>
          <button onClick={() => { setEditingItem(null); setShowForm(true); }} className="btn-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Analysis
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
            placeholder="Search trends..."
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

      {/* Trends Grid */}
      {loading ? (
        <CardGridSkeleton count={6} />
      ) : filteredTrends.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center" style={{ boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.04)' }}>
          <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
            </svg>
          </div>
          <p className="text-gray-500 mb-1 font-medium">No trend analyses found</p>
          <p className="text-sm text-gray-400 mb-5">Create your first trend analysis to get started</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Analyze Trends
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTrends.map((trend) => (
              <ContentCard
                key={trend.id}
                id={trend.id}
                title={trend.niche}
                subtitle={`${trend.platform} - ${trend.timeframe}`}
                status={trend.status || 'draft'}
                scheduledAt={trend.scheduledAt}
                createdAt={trend.createdAt}
                icon=""
                color="bg-orange-50"
                onClick={() => setSelectedTrend(trend)}
                onStatusClick={() => {
                  setSelectedTrend(trend);
                  setShowStatusModal(true);
                }}
                selected={selectedIds.includes(trend.id)}
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
      {selectedTrend && !showStatusModal && (
        <Modal title="Trend Analysis" onClose={() => setSelectedTrend(null)}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{selectedTrend.niche}</h3>
              <StatusBadge status={selectedTrend.status || 'draft'} />
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Platform:</span>
                <p className="font-medium">{selectedTrend.platform}</p>
              </div>
              <div>
                <span className="text-gray-500">Timeframe:</span>
                <p className="font-medium">{selectedTrend.timeframe}</p>
              </div>
              <div>
                <span className="text-gray-500">Region:</span>
                <p className="font-medium">{selectedTrend.region || 'Global'}</p>
              </div>
            </div>

            {selectedTrend.aiOutput && (
              <div>
                <span className="text-sm text-gray-500">Trend Analysis:</span>
                <div className="mt-2 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg p-4 max-h-80 overflow-y-auto border border-orange-100">
                  <pre className="text-sm whitespace-pre-wrap">{selectedTrend.aiOutput}</pre>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4 border-t border-gray-100">
              <button
                onClick={() => handleDelete(selectedTrend.id)}
                className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
              >
                Delete
              </button>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(selectedTrend)} className="btn-secondary text-sm">
                  Edit
                </button>
                <button onClick={() => setShowStatusModal(true)} className="btn-secondary text-sm">
                  Change Status
                </button>
                <button onClick={() => setSelectedTrend(null)} className="btn-primary text-sm">
                  Close
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Form Modal */}
      {showForm && (
        <Modal title={editingItem ? 'Edit Trend Analysis' : 'New Trend Analysis'} onClose={() => { setShowForm(false); setEditingItem(null); }}>
          <ItemForm
            feature={feature}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditingItem(null); }}
            initialData={editingItem || undefined}
          />
        </Modal>
      )}

      {/* Status Modal */}
      {showStatusModal && selectedTrend && (
        <DraftPublishModal
          currentStatus={selectedTrend.status || 'draft'}
          scheduledAt={selectedTrend.scheduledAt}
          onClose={() => {
            setShowStatusModal(false);
            setSelectedTrend(null);
          }}
          onSave={handleStatusSave}
        />
      )}
    </PageLayout>
  );
}
