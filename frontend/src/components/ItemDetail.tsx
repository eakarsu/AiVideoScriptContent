import { useState } from 'react';
import { api } from '../services/api';

interface Field {
  name: string;
  label: string;
  type: string;
}

interface Feature {
  id: string;
  name: string;
  endpoint: string;
  fields: Field[];
  generateFields: string[];
}

interface Item {
  id: number;
  [key: string]: any;
  aiOutput: string;
  createdAt: string;
  updatedAt: string;
}

interface ItemDetailProps {
  item: Item;
  feature: Feature;
  onDelete: () => void;
  onClose: () => void;
  onUpdate: (updatedItem: Item) => void;
}

export default function ItemDetail({ item, feature, onDelete, onClose, onUpdate }: ItemDetailProps) {
  const [aiOutput, setAiOutput] = useState(item.aiOutput);
  const [regenerating, setRegenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleRegenerate = async () => {
    setError('');
    setRegenerating(true);

    try {
      // Build generate request from item's existing data
      const generateData: Record<string, any> = {};
      feature.generateFields.forEach((field) => {
        if (item[field]) {
          generateData[field] = item[field];
        }
      });

      const response = await api.post(`${feature.endpoint}/generate`, generateData);
      setAiOutput(response.data.aiOutput);
      setHasChanges(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to regenerate content');
    } finally {
      setRegenerating(false);
    }
  };

  const handleSave = async () => {
    setError('');
    setSaving(true);

    try {
      const response = await api.put(`${feature.endpoint}/${item.id}`, { aiOutput });
      onUpdate({ ...item, aiOutput, updatedAt: new Date().toISOString() });
      setHasChanges(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Item Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {feature.fields.map((field) => (
          <div key={field.name} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              {field.label}
            </label>
            <div className="text-gray-800">
              {field.type === 'checkbox' ? (
                <span className={`px-2 py-1 rounded text-sm ${
                  item[field.name] ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                }`}>
                  {item[field.name] ? 'Yes' : 'No'}
                </span>
              ) : field.type === 'textarea' ? (
                <p className="bg-gray-50 p-3 rounded-lg text-sm whitespace-pre-wrap">
                  {item[field.name] || '-'}
                </p>
              ) : (
                <p className="font-medium">{item[field.name] || '-'}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Regenerate Button */}
      <div className="flex justify-center">
        <button
          onClick={handleRegenerate}
          disabled={regenerating}
          className={`px-8 py-4 rounded-lg font-bold text-lg transition-all shadow-lg ${
            regenerating
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 hover:shadow-xl'
          }`}
        >
          {regenerating ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Regenerating...
            </span>
          ) : (
            'Regenerate with AI'
          )}
        </button>
      </div>

      {/* AI Output */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
            AI Generated Content
            {hasChanges && <span className="ml-2 text-orange-500">(unsaved changes)</span>}
          </label>
          <button
            onClick={() => copyToClipboard(aiOutput)}
            className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy
          </button>
        </div>
        <div className="bg-gradient-to-br from-primary-50 to-purple-50 rounded-lg p-4 border border-primary-100">
          <pre className="whitespace-pre-wrap text-sm text-gray-800 max-h-96 overflow-y-auto">
            {aiOutput}
          </pre>
        </div>
      </div>

      {/* Metadata */}
      <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
        <div>
          <span>Created: {new Date(item.createdAt).toLocaleString()}</span>
        </div>
        <div>
          <span>Updated: {new Date(item.updatedAt).toLocaleString()}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-4 border-t">
        <button
          onClick={onDelete}
          className="btn-danger"
        >
          Delete
        </button>
        <div className="flex gap-3">
          {hasChanges && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          )}
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
