import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api, getFeatureById } from '../services/api';
import Modal from '../components/Modal';
import ItemForm from '../components/ItemForm';
import ItemDetail from '../components/ItemDetail';

interface Item {
  id: number;
  [key: string]: any;
  aiOutput: string;
  createdAt: string;
  updatedAt: string;
}

export default function FeaturePage() {
  const { featureId } = useParams<{ featureId: string }>();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const feature = getFeatureById(featureId || '');

  useEffect(() => {
    if (feature) {
      fetchItems();
    }
  }, [featureId]);

  const fetchItems = async () => {
    if (!feature) return;

    setLoading(true);
    try {
      const response = await api.get(feature.endpoint);
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (item: Item) => {
    setSelectedItem(item);
  };

  const handleCloseDetail = () => {
    setSelectedItem(null);
  };

  const handleNewItem = () => {
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
  };

  const handleSaveItem = async (data: any) => {
    if (!feature) return;

    try {
      await api.post(feature.endpoint, data);
      await fetchItems();
      setShowForm(false);
    } catch (error) {
      console.error('Error saving item:', error);
      throw error;
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!feature) return;

    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await api.delete(`${feature.endpoint}/${id}`);
        await fetchItems();
        setSelectedItem(null);
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  const handleUpdateItem = (updatedItem: Item) => {
    setItems(items.map(item => item.id === updatedItem.id ? updatedItem : item));
    setSelectedItem(updatedItem);
  };

  const filteredItems = items.filter((item) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return Object.values(item).some(
      (value) =>
        typeof value === 'string' && value.toLowerCase().includes(searchLower)
    );
  });

  if (!feature) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Feature not found</h2>
          <button onClick={() => navigate('/dashboard')} className="btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 hover:text-gray-800"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex items-center gap-3">
                <div className={`${feature.color} w-10 h-10 rounded-lg flex items-center justify-center text-xl`}>
                  {feature.icon}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{feature.name}</h1>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleNewItem} className="btn-primary">
                + New Item
              </button>
              <button onClick={logout} className="btn-secondary">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-6 flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
            />
          </div>
          <div className="text-gray-600 flex items-center">
            {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Items Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : filteredItems.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 mb-4">No items yet. Create your first one!</p>
              <button onClick={handleNewItem} className="btn-primary">
                + Create New
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {feature.displayField}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {feature.secondaryField}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredItems.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      className="table-row-hover"
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                          {item[feature.displayField] || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {item[feature.secondaryField] || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteItem(item.id);
                          }}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Detail Modal */}
      {selectedItem && (
        <Modal key={selectedItem.id} onClose={handleCloseDetail} title="Item Details">
          <ItemDetail
            item={selectedItem}
            feature={feature}
            onDelete={() => handleDeleteItem(selectedItem.id)}
            onClose={handleCloseDetail}
            onUpdate={handleUpdateItem}
          />
        </Modal>
      )}

      {/* Form Modal */}
      {showForm && (
        <Modal onClose={handleCloseForm} title={`New ${feature.name}`}>
          <ItemForm
            feature={feature}
            onSave={handleSaveItem}
            onCancel={handleCloseForm}
          />
        </Modal>
      )}
    </div>
  );
}
