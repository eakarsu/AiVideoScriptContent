import { useState, useEffect } from 'react';
import PageLayout from '../components/PageLayout';
import ContentCard from '../components/ContentCard';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import ItemForm from '../components/ItemForm';
import DraftPublishModal from '../components/DraftPublishModal';
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
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const feature = getFeatureById('scripts')!;

  useEffect(() => {
    fetchScripts();
  }, [statusFilter]);

  const fetchScripts = async () => {
    setLoading(true);
    try {
      const endpoint = statusFilter !== 'all' ? `/scripts?status=${statusFilter}` : '/scripts';
      const response = await api.get(endpoint);
      setScripts(response.data);
    } catch (error) {
      console.error('Error fetching scripts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: any) => {
    try {
      await api.post('/scripts', data);
      await fetchScripts();
      setShowForm(false);
    } catch (error) {
      console.error('Error saving script:', error);
      throw error;
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this script?')) return;
    try {
      await api.delete(`/scripts/${id}`);
      await fetchScripts();
      setSelectedScript(null);
    } catch (error) {
      console.error('Error deleting script:', error);
    }
  };

  const handleStatusSave = async (status: 'draft' | 'scheduled' | 'published', scheduledAt: string | null) => {
    if (!selectedScript) return;
    try {
      await api.put(`/scripts/${selectedScript.id}`, { status, scheduledAt });
      await fetchScripts();
      setShowStatusModal(false);
      setSelectedScript(null);
    } catch (error) {
      throw error;
    }
  };

  const filteredScripts = scripts.filter((script) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      script.title.toLowerCase().includes(search) ||
      script.topic.toLowerCase().includes(search) ||
      script.platform.toLowerCase().includes(search)
    );
  });

  return (
    <PageLayout
      title="Scripts"
      subtitle="Manage your video scripts"
      icon="📝"
      actions={
        <button onClick={() => setShowForm(true)} className="btn-primary">
          + New Script
        </button>
      }
    >
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search scripts..."
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

      {/* Scripts Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading scripts...</div>
      ) : filteredScripts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-gray-500 mb-4">No scripts found. Create your first one!</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            + Create Script
          </button>
        </div>
      ) : (
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
              icon="📝"
              color="bg-blue-100"
              onClick={() => setSelectedScript(script)}
              onStatusClick={() => {
                setSelectedScript(script);
                setShowStatusModal(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedScript && !showStatusModal && (
        <Modal title="Script Details" onClose={() => setSelectedScript(null)}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{selectedScript.title}</h3>
              <StatusBadge status={selectedScript.status || 'draft'} />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Topic:</span>
                <p className="font-medium">{selectedScript.topic}</p>
              </div>
              <div>
                <span className="text-gray-500">Platform:</span>
                <p className="font-medium">{selectedScript.platform}</p>
              </div>
              <div>
                <span className="text-gray-500">Duration:</span>
                <p className="font-medium">{selectedScript.duration}</p>
              </div>
              <div>
                <span className="text-gray-500">Tone:</span>
                <p className="font-medium">{selectedScript.tone}</p>
              </div>
            </div>

            {selectedScript.aiOutput && (
              <div>
                <span className="text-sm text-gray-500">Generated Script:</span>
                <div className="mt-2 bg-gray-50 rounded-lg p-4 max-h-80 overflow-y-auto">
                  <pre className="text-sm whitespace-pre-wrap font-mono">{selectedScript.aiOutput}</pre>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4 border-t">
              <button
                onClick={() => handleDelete(selectedScript.id)}
                className="text-red-600 hover:text-red-800"
              >
                Delete
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowStatusModal(true)}
                  className="btn-secondary"
                >
                  Change Status
                </button>
                <button
                  onClick={() => setSelectedScript(null)}
                  className="btn-primary"
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
        <Modal title="New Script" onClose={() => setShowForm(false)}>
          <ItemForm feature={feature} onSave={handleSave} onCancel={() => setShowForm(false)} />
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
