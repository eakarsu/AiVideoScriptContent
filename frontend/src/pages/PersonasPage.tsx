import { useState, useEffect } from 'react';
import PageLayout from '../components/PageLayout';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import ItemForm from '../components/ItemForm';
import DraftPublishModal from '../components/DraftPublishModal';
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
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const feature = getFeatureById('personas')!;

  useEffect(() => {
    fetchPersonas();
  }, [statusFilter]);

  const fetchPersonas = async () => {
    setLoading(true);
    try {
      const endpoint = statusFilter !== 'all' ? `/personas?status=${statusFilter}` : '/personas';
      const response = await api.get(endpoint);
      setPersonas(response.data);
    } catch (error) {
      console.error('Error fetching personas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: any) => {
    try {
      await api.post('/personas', data);
      await fetchPersonas();
      setShowForm(false);
    } catch (error) {
      throw error;
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this persona?')) return;
    try {
      await api.delete(`/personas/${id}`);
      await fetchPersonas();
      setSelectedPersona(null);
    } catch (error) {
      console.error('Error deleting persona:', error);
    }
  };

  const handleStatusSave = async (status: 'draft' | 'scheduled' | 'published', scheduledAt: string | null) => {
    if (!selectedPersona) return;
    try {
      await api.put(`/personas/${selectedPersona.id}`, { status, scheduledAt });
      await fetchPersonas();
      setShowStatusModal(false);
      setSelectedPersona(null);
    } catch (error) {
      throw error;
    }
  };

  const filteredPersonas = personas.filter((persona) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
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

  return (
    <PageLayout
      title="Personas"
      subtitle="Target audience profiles for your content"
      icon="👤"
      actions={
        <button onClick={() => setShowForm(true)} className="btn-primary">
          + New Persona
        </button>
      }
    >
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search personas..."
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

      {/* Personas Grid - Card Style */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading personas...</div>
      ) : filteredPersonas.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-gray-500 mb-4">No personas found. Create your first one!</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            + Create Persona
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPersonas.map((persona) => (
            <div
              key={persona.id}
              onClick={() => setSelectedPersona(persona)}
              className="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
            >
              {/* Avatar Header */}
              <div className={`h-24 bg-gradient-to-br ${getAvatarColor(persona.niche)} flex items-center justify-center relative`}>
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl shadow-lg">
                  👤
                </div>
                <div className="absolute top-2 right-2">
                  <StatusBadge status={persona.status || 'draft'} size="sm" />
                </div>
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
      )}

      {/* Detail Modal */}
      {selectedPersona && !showStatusModal && (
        <Modal title="Audience Persona" onClose={() => setSelectedPersona(null)}>
          <div className="space-y-4">
            {/* Avatar */}
            <div className={`h-32 rounded-lg bg-gradient-to-br ${getAvatarColor(selectedPersona.niche)} flex items-center justify-center`}>
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-4xl shadow-lg">
                👤
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

            <div className="flex justify-between pt-4 border-t">
              <button onClick={() => handleDelete(selectedPersona.id)} className="text-red-600 hover:text-red-800">
                Delete
              </button>
              <div className="flex gap-2">
                <button onClick={() => setShowStatusModal(true)} className="btn-secondary">
                  Change Status
                </button>
                <button onClick={() => setSelectedPersona(null)} className="btn-primary">
                  Close
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Form Modal */}
      {showForm && (
        <Modal title="New Persona" onClose={() => setShowForm(false)}>
          <ItemForm feature={feature} onSave={handleSave} onCancel={() => setShowForm(false)} />
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
