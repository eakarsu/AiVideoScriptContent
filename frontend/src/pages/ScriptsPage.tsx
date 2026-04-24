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

interface Script {
  id: number;
  title: string;
  topic: string;
  platform: string;
  duration: string;
  tone: string;
  aiOutput: string;
  status: 'draft' | 'scheduled' | 'published';
  scheduledAt: string | null;
  createdAt: string;
}

export default function ScriptsPage() {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingScript, setEditingScript] = useState<Script | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  const { filters, setFilter } = usePersistedFilters();
  const debouncedSearch = useDebounce(filters.searchTerm, 300);
  const { addToast } = useToast();
  const confirm = useConfirm();
  const feature = getFeatureById('scripts')!;

  useEffect(() => {
    fetchScripts();
  }, [filters.statusFilter, filters.page, filters.sortBy, debouncedSearch]);

  const fetchScripts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.statusFilter !== 'all') params.set('status', filters.statusFilter);
      params.set('page', String(filters.page));
      params.set('limit', '12');
      const [sortField, sortDir] = filters.sortBy.split('_');
      params.set('sortBy', sortField);
      params.set('sortOrder', sortDir || 'DESC');

      const response = await api.get(`/scripts?${params.toString()}`);
      const data = response.data;
      setScripts(data.data || data);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      addToast('Failed to load scripts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: any) => {
    try {
      if (editingScript) {
        await api.put(`/scripts/${editingScript.id}`, data);
        addToast('Script updated successfully', 'success');
      } else {
        await api.post('/scripts', data);
        addToast('Script created successfully', 'success');
      }
      await fetchScripts();
      setShowForm(false);
      setEditingScript(null);
    } catch (error) {
      addToast('Failed to save script', 'error');
      throw error;
    }
  };

  const handleDelete = async (id: number) => {
    const ok = await confirm({
      title: 'Delete Script',
      message: 'Are you sure you want to delete this script? This action cannot be undone.',
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await api.delete(`/scripts/${id}`);
      addToast('Script deleted', 'success');
      await fetchScripts();
      setSelectedScript(null);
    } catch (error) {
      addToast('Failed to delete script', 'error');
    }
  };

  const handleStatusSave = async (status: 'draft' | 'scheduled' | 'published', scheduledAt: string | null) => {
    if (!selectedScript) return;
    try {
      await api.put(`/scripts/${selectedScript.id}`, { status, scheduledAt });
      addToast('Status updated', 'success');
      await fetchScripts();
      setShowStatusModal(false);
      setSelectedScript(null);
    } catch (error) {
      addToast('Failed to update status', 'error');
      throw error;
    }
  };

  const handleEdit = (script: Script) => {
    setEditingScript(script);
    setSelectedScript(null);
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
      await api.post('/scripts/bulk-delete', { ids: selectedIds });
      addToast(`${selectedIds.length} scripts deleted`, 'success');
      setSelectedIds([]);
      await fetchScripts();
    } catch (error) {
      addToast('Failed to delete selected scripts', 'error');
    }
  };

  const handleBulkStatus = async (status: 'draft' | 'scheduled' | 'published') => {
    try {
      await api.post('/scripts/bulk-status', { ids: selectedIds, status });
      addToast(`${selectedIds.length} scripts updated to ${status}`, 'success');
      setSelectedIds([]);
      await fetchScripts();
    } catch (error) {
      addToast('Failed to update status', 'error');
    }
  };

  // Filter client-side by search (already debounced for UX but backend handles the real data)
  const filteredScripts = scripts.filter((script) => {
    if (!filters.searchTerm) return true;
    const search = filters.searchTerm.toLowerCase();
    return (
      script.title.toLowerCase().includes(search) ||
      script.topic.toLowerCase().includes(search) ||
      script.platform.toLowerCase().includes(search)
    );
  });

  const exportColumns = [
    { key: 'title', label: 'Title' },
    { key: 'topic', label: 'Topic' },
    { key: 'platform', label: 'Platform' },
    { key: 'duration', label: 'Duration' },
    { key: 'tone', label: 'Tone' },
    { key: 'status', label: 'Status' },
    { key: 'createdAt', label: 'Created' },
  ];

  return (
    <PageLayout
      title="Scripts"
      subtitle="Manage your video scripts"
      icon=""
      actions={
        <div className="flex items-center gap-2">
          <button onClick={() => exportToCSV(filteredScripts, 'scripts', exportColumns)} className="btn-secondary text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            CSV
          </button>
          <button onClick={() => exportToPDF(filteredScripts, 'scripts', exportColumns, 'Scripts')} className="btn-secondary text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            PDF
          </button>
          <button onClick={() => { setEditingScript(null); setShowForm(true); }} className="btn-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Script
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
            placeholder="Search scripts..."
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

      {/* Scripts Grid */}
      {loading ? (
        <CardGridSkeleton count={6} />
      ) : filteredScripts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center" style={{ boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.04)' }}>
          <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <p className="text-gray-500 mb-1 font-medium">No scripts found</p>
          <p className="text-sm text-gray-400 mb-5">Create your first script to get started</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create Script
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredScripts.map((script) => (
              <ContentCard
                key={script.id}
                id={script.id}
                title={script.title}
                subtitle={`${script.platform} - ${script.duration}`}
                status={script.status || 'draft'}
                scheduledAt={script.scheduledAt}
                createdAt={script.createdAt}
                icon=""
                color="bg-blue-50"
                onClick={() => setSelectedScript(script)}
                onStatusClick={() => {
                  setSelectedScript(script);
                  setShowStatusModal(true);
                }}
                selected={selectedIds.includes(script.id)}
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
      {selectedScript && !showStatusModal && (
        <Modal title="Script Details" onClose={() => setSelectedScript(null)}>
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">{selectedScript.title}</h3>
              <StatusBadge status={selectedScript.status || 'draft'} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Topic', value: selectedScript.topic },
                { label: 'Platform', value: selectedScript.platform },
                { label: 'Duration', value: selectedScript.duration },
                { label: 'Tone', value: selectedScript.tone },
              ].map((item) => (
                <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{item.label}</span>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>

            {selectedScript.aiOutput && (
              <AIOutputDisplay content={selectedScript.aiOutput} title="Generated Script" />
            )}

            <div className="flex justify-between pt-4 border-t border-gray-100">
              <button
                onClick={() => handleDelete(selectedScript.id)}
                className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
              >
                Delete
              </button>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(selectedScript)} className="btn-secondary text-sm">
                  Edit
                </button>
                <button
                  onClick={() => setShowStatusModal(true)}
                  className="btn-secondary text-sm"
                >
                  Change Status
                </button>
                <button
                  onClick={() => setSelectedScript(null)}
                  className="btn-primary text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Form Modal */}
      {showForm && (
        <Modal title={editingScript ? 'Edit Script' : 'New Script'} onClose={() => { setShowForm(false); setEditingScript(null); }}>
          <ItemForm
            feature={feature}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditingScript(null); }}
            initialData={editingScript || undefined}
          />
        </Modal>
      )}

      {/* Status Modal */}
      {showStatusModal && selectedScript && (
        <DraftPublishModal
          currentStatus={selectedScript.status || 'draft'}
          scheduledAt={selectedScript.scheduledAt}
          onClose={() => {
            setShowStatusModal(false);
            setSelectedScript(null);
          }}
          onSave={handleStatusSave}
        />
      )}
    </PageLayout>
  );
}
