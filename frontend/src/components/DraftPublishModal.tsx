import { useState } from 'react';
import Modal from './Modal';
import StatusBadge from './StatusBadge';

interface DraftPublishModalProps {
  currentStatus: 'draft' | 'scheduled' | 'published';
  scheduledAt?: string | null;
  onClose: () => void;
  onSave: (status: 'draft' | 'scheduled' | 'published', scheduledAt: string | null) => Promise<void>;
}

export default function DraftPublishModal({
  currentStatus,
  scheduledAt: currentScheduledAt,
  onClose,
  onSave,
}: DraftPublishModalProps) {
  const [status, setStatus] = useState<'draft' | 'scheduled' | 'published'>(currentStatus);
  const [scheduledAt, setScheduledAt] = useState(
    currentScheduledAt ? new Date(currentScheduledAt).toISOString().slice(0, 16) : ''
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(
        status,
        status === 'scheduled' ? new Date(scheduledAt).toISOString() : null
      );
      onClose();
    } catch (error) {
      console.error('Error saving status:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Update Status" onClose={onClose}>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Current Status
          </label>
          <StatusBadge status={currentStatus} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            New Status
          </label>
          <div className="space-y-3">
            {/* Draft Option */}
            <button
              onClick={() => setStatus('draft')}
              className={`w-full px-4 py-3 rounded-lg border-2 transition-all text-left ${
                status === 'draft'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <StatusBadge status="draft" />
              <p className="text-xs text-gray-500 mt-1">Save as work in progress</p>
            </button>

            {/* Scheduled Option with Date Picker */}
            <div
              className={`rounded-lg border-2 transition-all ${
                status === 'scheduled'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200'
              }`}
            >
              <button
                onClick={() => {
                  setStatus('scheduled');
                  if (!scheduledAt) {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    tomorrow.setHours(9, 0, 0, 0);
                    setScheduledAt(tomorrow.toISOString().slice(0, 16));
                  }
                }}
                className="w-full px-4 py-3 text-left"
              >
                <StatusBadge status="scheduled" />
                <p className="text-xs text-gray-500 mt-1">Set a future publish date</p>
              </button>

              {/* Date Picker - Always visible under Scheduled */}
              <div className="px-4 pb-4">
                <label className="block text-sm font-medium text-blue-700 mb-2">
                  Schedule Date & Time:
                </label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => {
                    setScheduledAt(e.target.value);
                    setStatus('scheduled');
                  }}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Published Option */}
            <button
              onClick={() => setStatus('published')}
              className={`w-full px-4 py-3 rounded-lg border-2 transition-all text-left ${
                status === 'published'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <StatusBadge status="published" />
              <p className="text-xs text-gray-500 mt-1">Mark as already published</p>
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || (status === 'scheduled' && !scheduledAt)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Update Status'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
