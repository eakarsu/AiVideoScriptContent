import { useState } from 'react';
import { api } from '../services/api';

interface Field {
  name: string;
  label: string;
  type: string;
  options?: string[];
  required?: boolean;
}

interface Feature {
  id: string;
  name: string;
  endpoint: string;
  fields: Field[];
  generateFields: string[];
}

interface ItemFormProps {
  feature: Feature;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
}

export default function ItemForm({ feature, onSave, onCancel }: ItemFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [aiOutput, setAiOutput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async () => {
    setError('');
    setGenerating(true);

    try {
      // Build the generate request with only the required fields
      const generateData: Record<string, any> = {};
      feature.generateFields.forEach((field) => {
        if (formData[field]) {
          generateData[field] = formData[field];
        }
      });

      const response = await api.post(`${feature.endpoint}/generate`, generateData);
      setAiOutput(response.data.aiOutput);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate content');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!aiOutput) {
      setError('Please generate content first');
      return;
    }

    setError('');
    setSaving(true);

    try {
      await onSave({ ...formData, aiOutput });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const canGenerate = feature.generateFields.every(
    (field) => formData[field] && String(formData[field]).trim() !== ''
  );

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {feature.fields.map((field) => (
          <div
            key={field.name}
            className={field.type === 'textarea' ? 'md:col-span-2' : ''}
          >
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {field.type === 'select' ? (
              <select
                value={formData[field.name] || ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
                className="input-field"
              >
                <option value="">Select {field.label}</option>
                {field.options?.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : field.type === 'textarea' ? (
              <textarea
                value={formData[field.name] || ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
                className="input-field h-24"
                placeholder={`Enter ${field.label.toLowerCase()}`}
              />
            ) : field.type === 'checkbox' ? (
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData[field.name] || false}
                  onChange={(e) => handleChange(field.name, e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <span className="text-sm text-gray-600">Enable</span>
              </label>
            ) : field.type === 'number' ? (
              <input
                type="number"
                value={formData[field.name] || ''}
                onChange={(e) => handleChange(field.name, parseInt(e.target.value) || '')}
                className="input-field"
                placeholder={`Enter ${field.label.toLowerCase()}`}
              />
            ) : (
              <input
                type="text"
                value={formData[field.name] || ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
                className="input-field"
                placeholder={`Enter ${field.label.toLowerCase()}`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Generate Button */}
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={handleGenerate}
          disabled={!canGenerate || generating}
          className={`px-8 py-4 rounded-lg font-bold text-lg transition-all shadow-lg ${
            canGenerate && !generating
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 hover:shadow-xl'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {generating ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Generating with AI...
            </span>
          ) : (
            'Generate with AI'
          )}
        </button>
        {!canGenerate && (
          <p className="text-sm text-gray-500">Fill in required fields (*) to enable generation</p>
        )}
      </div>

      {/* AI Output */}
      {aiOutput && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-700">Generated Content</h4>
            <button
              onClick={() => navigator.clipboard.writeText(aiOutput)}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              Copy
            </button>
          </div>
          <div className="prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap text-sm text-gray-800 bg-white p-4 rounded border max-h-64 overflow-y-auto">
              {aiOutput}
            </pre>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!aiOutput || saving}
          className="btn-primary"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}
