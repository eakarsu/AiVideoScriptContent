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
          <label className="block text-sm font-medium text-gray-500 mb-2">
            Current Status
          </label>
          <StatusBadge status={currentStatus} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            New Status
          </label>
          <div className="space-y-2.5">
            {/* Draft Option */}
            <button
              onClick={() => setStatus('draft')}
              className={`w-full px-4 py-3.5 rounded-xl border-2 transition-all text-left ${
                status === 'draft'
                  ? 'border-primary-500 bg-primary-50/50'
                  : 'border-gray-100 hover:border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <StatusBadge status="draft" />
                  <p className="text-xs text-gray-500 mt-1.5 ml-0.5">Save as work in progress</p>
                </div>
                {status === 'draft' && (
                  <svg className="w-5 h-5 text-primary-500" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </button>

            {/* Scheduled Option */}
            <div
              className={`rounded-xl border-2 transition-all ${
                status === 'scheduled'
                  ? 'border-amber-400 bg-amber-50/30'
                  : 'border-gray-100 bg-white'
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
                className="w-full px-4 py-3.5 text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <StatusBadge status="scheduled" />
                    <p className="text-xs text-gray-500 mt-1.5 ml-0.5">Set a future publish date</p>
                  </div>
                  {status === 'scheduled' && (
                    <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </button>

              <div className="px-4 pb-4">
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => {
                    setScheduledAt(e.target.value);
                    setStatus('scheduled');
                  }}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 bg-white text-sm transition-all"
                />
              </div>
            </div>

            {/* Published Option */}
            <button
              onClick={() => setStatus('published')}
              className={`w-full px-4 py-3.5 rounded-xl border-2 transition-all text-left ${
                status === 'published'
                  ? 'border-emerald-400 bg-emerald-50/30'
                  : 'border-gray-100 hover:border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <StatusBadge status="published" />
                  <p className="text-xs text-gray-500 mt-1.5 ml-0.5">Mark as already published</p>
                </div>
                {status === 'published' && (
                  <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || (status === 'scheduled' && !scheduledAt)}
            className="btn-primary"
          >
            {saving ? 'Saving...' : 'Update Status'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
