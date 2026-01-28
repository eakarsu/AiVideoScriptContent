import { useState, useEffect } from 'react';
import PageLayout from '../components/PageLayout';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import ItemForm from '../components/ItemForm';
import DraftPublishModal from '../components/DraftPublishModal';
import { api, getFeatureById } from '../services/api';

interface Hook {
  id: number;
  topic: string;
  platform: string;
  hookType: string;
  targetEmotion: string;
  aiOutput: string;
  status: 'draft' | 'scheduled' | 'published';
  scheduledAt: string | null;
  createdAt: string;
}

const hookTypeColors: Record<string, string> = {
  Question: 'bg-blue-100 border-blue-300',
  Statement: 'bg-green-100 border-green-300',
  Story: 'bg-purple-100 border-purple-300',
  Shock: 'bg-red-100 border-red-300',
  Promise: 'bg-yellow-100 border-yellow-300',
};

export default function HooksPage() {
  const [hooks, setHooks] = useState<Hook[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHook, setSelectedHook] = useState<Hook | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const feature = getFeatureById('hooks')!;

  useEffect(() => {
    fetchHooks();
  }, [statusFilter]);

  const fetchHooks = async () => {
    setLoading(true);
    try {
      const endpoint = statusFilter !== 'all' ? `/hooks?status=${statusFilter}` : '/hooks';
      const response = await api.get(endpoint);
      setHooks(response.data);
    } catch (error) {
      console.error('Error fetching hooks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: any) => {
    try {
      await api.post('/hooks', data);
      await fetchHooks();
      setShowForm(false);
    } catch (error) {
      throw error;
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this hook?')) return;
    try {
      await api.delete(`/hooks/${id}`);
      await fetchHooks();
      setSelectedHook(null);
    } catch (error) {
      console.error('Error deleting hook:', error);
    }
  };

  const handleStatusSave = async (status: 'draft' | 'scheduled' | 'published', scheduledAt: string | null) => {
    if (!selectedHook) return;
    try {
      await api.put(`/hooks/${selectedHook.id}`, { status, scheduledAt });
      await fetchHooks();
      setShowStatusModal(false);
      setSelectedHook(null);
    } catch (error) {
      throw error;
    }
  };

  const filteredHooks = hooks.filter((hook) => {
    if (typeFilter !== 'all' && hook.hookType !== typeFilter) return false;
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      hook.topic.toLowerCase().includes(search) ||
      hook.hookType.toLowerCase().includes(search) ||
      hook.aiOutput?.toLowerCase().includes(search)
    );
  });

  const hookTypes = ['Question', 'Statement', 'Story', 'Shock', 'Promise'];

  return (
    <PageLayout
      title="Hooks"
      subtitle="Attention-grabbing intros for your videos"
      icon="🪝"
      actions={
        <button onClick={() => setShowForm(true)} className="btn-primary">
          + New Hook
        </button>
      }
    >
      {/* Filters */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search hooks..."
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

        {/* Hook Type Categorization */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              typeFilter === 'all'
                ? 'bg-gray-800 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Types
          </button>
          {hookTypes.map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                typeFilter === type
                  ? hookTypeColors[type]
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Hooks Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading hooks...</div>
      ) : filteredHooks.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-gray-500 mb-4">No hooks found. Create your first one!</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            + Create Hook
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHooks.map((hook) => (
            <div
              key={hook.id}
              onClick={() => setSelectedHook(hook)}
              className={`bg-white rounded-lg shadow-sm border-l-4 p-4 cursor-pointer hover:shadow-md transition-shadow ${
                hookTypeColors[hook.hookType]?.split(' ')[1] || 'border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${hookTypeColors[hook.hookType]?.split(' ')[0] || 'bg-gray-100'}`}>
                  {hook.hookType}
                </span>
                <StatusBadge status={hook.status || 'draft'} size="sm" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">{hook.topic}</h3>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{hook.platform}</span>
                {hook.targetEmotion && (
                  <>
                    <span>-</span>
                    <span>{hook.targetEmotion}</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedHook && !showStatusModal && (
        <Modal title="Hook Details" onClose={() => setSelectedHook(null)}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm ${hookTypeColors[selectedHook.hookType]}`}>
                  {selectedHook.hookType}
                </span>
              </div>
              <StatusBadge status={selectedHook.status || 'draft'} />
            </div>

            <h3 className="text-lg font-semibold">{selectedHook.topic}</h3>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Platform:</span>
                <p className="font-medium">{selectedHook.platform}</p>
              </div>
              <div>
                <span className="text-gray-500">Target Emotion:</span>
                <p className="font-medium">{selectedHook.targetEmotion || 'Not specified'}</p>
              </div>
            </div>

            {selectedHook.aiOutput && (
              <div>
                <span className="text-sm text-gray-500">Generated Hooks:</span>
                <div className="mt-2 space-y-2">
                  {selectedHook.aiOutput.split('\n').filter(l => l.trim()).map((line, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-50 rounded-lg p-3 text-sm cursor-pointer hover:bg-gray-100"
                      onClick={() => navigator.clipboard.writeText(line)}
                    >
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4 border-t">
              <button onClick={() => handleDelete(selectedHook.id)} className="text-red-600 hover:text-red-800">
                Delete
              </button>
              <div className="flex gap-2">
                <button onClick={() => setShowStatusModal(true)} className="btn-secondary">
                  Change Status
                </button>
                <button onClick={() => setSelectedHook(null)} className="btn-primary">
                  Close
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Form Modal */}
      {showForm && (
        <Modal title="New Hook" onClose={() => setShowForm(false)}>
          <ItemForm feature={feature} onSave={handleSave} onCancel={() => setShowForm(false)} />
        </Modal>
      )}

      {/* Status Modal */}
      {showStatusModal && selectedHook && (
        <DraftPublishModal
          currentStatus={selectedHook.status || 'draft'}
          scheduledAt={selectedHook.scheduledAt}
          onClose={() => {
            setShowStatusModal(false);
            setSelectedHook(null);
          }}
          onSave={handleStatusSave}
        />
      )}
    </PageLayout>
  );
}
