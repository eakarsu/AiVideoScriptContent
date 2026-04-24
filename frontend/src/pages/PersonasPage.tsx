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

interface Persona {
  id: number;
  niche: string;
  platform: string;
  demographics: string;
  interests: string;
  aiOutput: string;
  status: 'draft' | 'scheduled' | 'published';
  scheduledAt: string | null;
  createdAt: string;
}

export default function PersonasPage() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Persona | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  const { filters, setFilter } = usePersistedFilters();
  const debouncedSearch = useDebounce(filters.searchTerm, 300);
  const { addToast } = useToast();
  const confirm = useConfirm();
  const feature = getFeatureById('personas')!;

  useEffect(() => {
    fetchPersonas();
  }, [filters.statusFilter, filters.page, filters.sortBy, debouncedSearch]);

  const fetchPersonas = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.statusFilter !== 'all') params.set('status', filters.statusFilter);
      params.set('page', String(filters.page));
      params.set('limit', '12');
      const [sortField, sortDir] = filters.sortBy.split('_');
      params.set('sortBy', sortField);
      params.set('sortOrder', sortDir || 'DESC');

      const response = await api.get(`/personas?${params.toString()}`);
      const data = response.data;
      setPersonas(data.data || data);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      addToast('Failed to load personas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: any) => {
    try {
      if (editingItem) {
        await api.put(`/personas/${editingItem.id}`, data);
        addToast('Persona updated successfully', 'success');
      } else {
        await api.post('/personas', data);
        addToast('Persona created successfully', 'success');
      }
      await fetchPersonas();
      setShowForm(false);
      setEditingItem(null);
    } catch (error) {
      addToast('Failed to save persona', 'error');
      throw error;
    }
  };

  const handleDelete = async (id: number) => {
    const ok = await confirm({
      title: 'Delete Persona',
      message: 'Are you sure you want to delete this persona? This action cannot be undone.',
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await api.delete(`/personas/${id}`);
      addToast('Persona deleted', 'success');
      await fetchPersonas();
      setSelectedPersona(null);
    } catch (error) {
      addToast('Failed to delete persona', 'error');
    }
  };

  const handleStatusSave = async (status: 'draft' | 'scheduled' | 'published', scheduledAt: string | null) => {
    if (!selectedPersona) return;
    try {
      await api.put(`/personas/${selectedPersona.id}`, { status, scheduledAt });
      addToast('Status updated', 'success');
      await fetchPersonas();
      setShowStatusModal(false);
      setSelectedPersona(null);
    } catch (error) {
      addToast('Failed to update status', 'error');
      throw error;
    }
  };

  const handleEdit = (item: Persona) => {
    setEditingItem(item);
    setSelectedPersona(null);
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
      await api.post('/personas/bulk-delete', { ids: selectedIds });
      addToast(`${selectedIds.length} personas deleted`, 'success');
      setSelectedIds([]);
      await fetchPersonas();
    } catch (error) {
      addToast('Failed to delete selected personas', 'error');
    }
  };

  const handleBulkStatus = async (status: 'draft' | 'scheduled' | 'published') => {
    try {
      await api.post('/personas/bulk-status', { ids: selectedIds, status });
      addToast(`${selectedIds.length} personas updated to ${status}`, 'success');
      setSelectedIds([]);
      await fetchPersonas();
    } catch (error) {
      addToast('Failed to update status', 'error');
    }
  };

  const filteredPersonas = personas.filter((persona) => {
    if (!filters.searchTerm) return true;
    const search = filters.searchTerm.toLowerCase();
    return (
      persona.niche.toLowerCase().includes(search) ||
      persona.platform.toLowerCase().includes(search) ||
      persona.aiOutput?.toLowerCase().includes(search)
    );
  });

  // Avatar colors based on niche
  const getAvatarColor = (niche: string): string => {
    const colors = [
      'from-purple-400 to-pink-400',
      'from-blue-400 to-cyan-400',
      'from-green-400 to-emerald-400',
      'from-yellow-400 to-orange-400',
      'from-red-400 to-pink-400',
    ];
    const index = niche.length % colors.length;
    return colors[index];
  };

  const exportColumns = [
    { key: 'niche', label: 'Niche' },
    { key: 'platform', label: 'Platform' },
    { key: 'demographics', label: 'Demographics' },
    { key: 'interests', label: 'Interests' },
    { key: 'status', label: 'Status' },
    { key: 'createdAt', label: 'Created' },
  ];

  return (
    <PageLayout
      title="Personas"
      subtitle="Target audience profiles for your content"
      icon=""
      actions={
        <div className="flex items-center gap-2">
          <button onClick={() => exportToCSV(filteredPersonas, 'personas', exportColumns)} className="btn-secondary text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            CSV
          </button>
          <button onClick={() => exportToPDF(filteredPersonas, 'personas', exportColumns, 'Personas')} className="btn-secondary text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            PDF
          </button>
          <button onClick={() => { setEditingItem(null); setShowForm(true); }} className="btn-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Persona
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
            placeholder="Search personas..."
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

      {/* Personas Grid - Card Style */}
      {loading ? (
        <CardGridSkeleton count={6} />
      ) : filteredPersonas.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center" style={{ boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.04)' }}>
          <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <p className="text-gray-500 mb-1 font-medium">No personas found</p>
          <p className="text-sm text-gray-400 mb-5">Create your first persona to get started</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create Persona
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPersonas.map((persona) => (
              <div
                key={persona.id}
                onClick={() => setSelectedPersona(persona)}
                className={`bg-white rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow border border-gray-100 ${
                  selectedIds.includes(persona.id) ? 'ring-2 ring-primary-500' : ''
                }`}
                style={{ boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.04)' }}
              >
                {/* Avatar Header */}
                <div className={`h-24 bg-gradient-to-br ${getAvatarColor(persona.niche)} flex items-center justify-center relative`}>
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl shadow-lg">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </div>
                  <div className="absolute top-2 right-2">
                    <StatusBadge status={persona.status || 'draft'} size="sm" />
                  </div>
                  {selectedIds.length > 0 && (
                    <div className="absolute top-2 left-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(persona.id)}
                        onChange={(e) => { e.stopPropagation(); toggleSelect(persona.id); }}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4 text-center">
                  <h3 className="font-semibold text-gray-900">{persona.niche}</h3>
                  <p className="text-sm text-gray-500">{persona.platform}</p>
                  {persona.demographics && (
                    <p className="text-xs text-gray-400 mt-2 truncate">{persona.demographics}</p>
                  )}
                  <div className="mt-3 text-xs text-gray-400">
                    {format(new Date(persona.createdAt), 'MMM d, yyyy')}
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
      {selectedPersona && !showStatusModal && (
        <Modal title="Audience Persona" onClose={() => setSelectedPersona(null)}>
          <div className="space-y-4">
            {/* Avatar */}
            <div className={`h-32 rounded-lg bg-gradient-to-br ${getAvatarColor(selectedPersona.niche)} flex items-center justify-center`}>
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-4xl shadow-lg">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{selectedPersona.niche}</h3>
              <StatusBadge status={selectedPersona.status || 'draft'} />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Platform:</span>
                <p className="font-medium">{selectedPersona.platform}</p>
              </div>
              <div>
                <span className="text-gray-500">Demographics:</span>
                <p className="font-medium">{selectedPersona.demographics || 'Not specified'}</p>
              </div>
              {selectedPersona.interests && (
                <div className="col-span-2">
                  <span className="text-gray-500">Interests:</span>
                  <p className="font-medium">{selectedPersona.interests}</p>
                </div>
              )}
            </div>

            {selectedPersona.aiOutput && (
              <div>
                <span className="text-sm text-gray-500">Persona Profile:</span>
                <div className="mt-2 bg-violet-50 rounded-lg p-4 max-h-60 overflow-y-auto border border-violet-100">
                  <pre className="text-sm whitespace-pre-wrap">{selectedPersona.aiOutput}</pre>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4 border-t border-gray-100">
              <button
                onClick={() => handleDelete(selectedPersona.id)}
                className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
              >
                Delete
              </button>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(selectedPersona)} className="btn-secondary text-sm">
                  Edit
                </button>
                <button onClick={() => setShowStatusModal(true)} className="btn-secondary text-sm">
                  Change Status
                </button>
                <button onClick={() => setSelectedPersona(null)} className="btn-primary text-sm">
                  Close
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Form Modal */}
      {showForm && (
        <Modal title={editingItem ? 'Edit Persona' : 'New Persona'} onClose={() => { setShowForm(false); setEditingItem(null); }}>
          <ItemForm
            feature={feature}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditingItem(null); }}
            initialData={editingItem || undefined}
          />
        </Modal>
      )}

      {/* Status Modal */}
      {showStatusModal && selectedPersona && (
        <DraftPublishModal
          currentStatus={selectedPersona.status || 'draft'}
          scheduledAt={selectedPersona.scheduledAt}
          onClose={() => {
            setShowStatusModal(false);
            setSelectedPersona(null);
          }}
          onSave={handleStatusSave}
        />
      )}
    </PageLayout>
  );
}
