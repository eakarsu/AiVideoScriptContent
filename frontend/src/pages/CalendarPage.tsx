import { useState, useEffect } from 'react';
import PageLayout from '../components/PageLayout';
import CalendarView, { CalendarItem } from '../components/CalendarView';
import Modal from '../components/Modal';
import DraftPublishModal from '../components/DraftPublishModal';
import { api, FEATURES } from '../services/api';

interface ContentItem {
  id: number;
  status: 'draft' | 'scheduled' | 'published';
  scheduledAt: string | null;
  createdAt: string;
  [key: string]: any;
}

interface ItemWithFeature extends ContentItem {
  featureId: string;
  featureName: string;
  displayValue: string;
}

const featureColors: Record<string, string> = {
  scripts: 'bg-blue-100 text-blue-800',
  titles: 'bg-green-100 text-green-800',
  descriptions: 'bg-purple-100 text-purple-800',
  hashtags: 'bg-pink-100 text-pink-800',
  thumbnails: 'bg-yellow-100 text-yellow-800',
  hooks: 'bg-red-100 text-red-800',
  trends: 'bg-orange-100 text-orange-800',
  seo: 'bg-lime-100 text-lime-800',
  personas: 'bg-violet-100 text-violet-800',
  repurpose: 'bg-emerald-100 text-emerald-800',
};

export default function CalendarPage() {
  const [items, setItems] = useState<ItemWithFeature[]>([]);
  const [calendarItems, setCalendarItems] = useState<CalendarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ItemWithFeature | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);

  useEffect(() => {
    fetchAllContent();
  }, []);

  const fetchAllContent = async () => {
    setLoading(true);
    try {
      const allItems: ItemWithFeature[] = [];

      await Promise.all(
        FEATURES.map(async (feature) => {
          try {
            const response = await api.get(feature.endpoint);
            response.data.forEach((item: ContentItem) => {
              allItems.push({
                ...item,
                featureId: feature.id,
                featureName: feature.name,
                displayValue: item[feature.displayField] || feature.name,
              });
            });
          } catch {
            // Ignore errors for individual features
          }
        })
      );

      setItems(allItems);

      // Convert to calendar items - only show scheduled items
      const calItems: CalendarItem[] = allItems
        .filter((item) => item.scheduledAt)
        .map((item) => ({
          id: `${item.featureId}-${item.id}`,
          title: item.displayValue,
          type: item.featureId,
          status: item.status || 'draft',
          scheduledAt: item.scheduledAt!,
          color: featureColors[item.featureId] || 'bg-gray-100',
        }));

      setCalendarItems(calItems);
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (calItem: CalendarItem) => {
    const [featureId, itemId] = calItem.id.split('-');
    const item = items.find((i) => i.featureId === featureId && i.id === parseInt(itemId));
    if (item) {
      setSelectedItem(item);
    }
  };

  const handleDateDrop = async (calItem: CalendarItem, newDate: Date) => {
    const [featureId, itemId] = calItem.id.split('-');
    const feature = FEATURES.find((f) => f.id === featureId);
    if (!feature) return;

    try {
      await api.put(`${feature.endpoint}/${itemId}`, {
        scheduledAt: newDate.toISOString(),
        status: 'scheduled',
      });
      await fetchAllContent();
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleStatusSave = async (status: 'draft' | 'scheduled' | 'published', scheduledAt: string | null) => {
    if (!selectedItem) return;

    const feature = FEATURES.find((f) => f.id === selectedItem.featureId);
    if (!feature) return;

    try {
      await api.put(`${feature.endpoint}/${selectedItem.id}`, {
        status,
        scheduledAt,
      });
      await fetchAllContent();
      setSelectedItem(null);
      setShowStatusModal(false);
    } catch (error) {
      console.error('Error updating status:', error);
      throw error;
    }
  };

  const unscheduledItems = items.filter((item) => !item.scheduledAt || item.status === 'draft');

  return (
    <PageLayout
      title="Content Calendar"
      subtitle="Schedule and manage your content"
      icon="📅"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
              Loading calendar...
            </div>
          ) : (
            <CalendarView
              items={calendarItems}
              onItemClick={handleItemClick}
              onDateDrop={handleDateDrop}
            />
          )}
        </div>

        {/* Sidebar - Unscheduled Items */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-semibold text-gray-900 mb-4">
              Unscheduled ({unscheduledItems.length})
            </h3>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {unscheduledItems.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No unscheduled items
                </p>
              ) : (
                unscheduledItems.slice(0, 20).map((item) => (
                  <div
                    key={`${item.featureId}-${item.id}`}
                    onClick={() => setSelectedItem(item)}
                    className={`p-3 rounded-lg cursor-pointer hover:opacity-80 ${
                      featureColors[item.featureId] || 'bg-gray-100'
                    }`}
                  >
                    <p className="text-sm font-medium truncate">{item.displayValue}</p>
                    <p className="text-xs opacity-75">{item.featureName}</p>
                  </div>
                ))
              )}
              {unscheduledItems.length > 20 && (
                <p className="text-xs text-gray-500 text-center pt-2">
                  +{unscheduledItems.length - 20} more items
                </p>
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="bg-white rounded-xl shadow-sm p-4 mt-4">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">Content Types</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(featureColors).slice(0, 6).map(([key, color]) => {
                const feature = FEATURES.find((f) => f.id === key);
                return (
                  <div key={key} className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded ${color.split(' ')[0]}`} />
                    <span className="text-xs text-gray-600">{feature?.name.split(' ')[0]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Item Detail Modal */}
      {selectedItem && !showStatusModal && (
        <Modal
          title={selectedItem.featureName}
          onClose={() => setSelectedItem(null)}
        >
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Title</label>
              <p className="text-gray-900">{selectedItem.displayValue}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <p className="text-gray-900 capitalize">{selectedItem.status || 'draft'}</p>
            </div>
            {selectedItem.scheduledAt && (
              <div>
                <label className="text-sm font-medium text-gray-500">Scheduled For</label>
                <p className="text-gray-900">
                  {new Date(selectedItem.scheduledAt).toLocaleString()}
                </p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-500">Created</label>
              <p className="text-gray-900">
                {new Date(selectedItem.createdAt).toLocaleString()}
              </p>
            </div>
            {selectedItem.aiOutput && (
              <div>
                <label className="text-sm font-medium text-gray-500">AI Output</label>
                <div className="mt-2 bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                    {selectedItem.aiOutput}
                  </pre>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Close
              </button>
              <button
                onClick={() => setShowStatusModal(true)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Change Status
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Status Change Modal */}
      {showStatusModal && selectedItem && (
        <DraftPublishModal
          currentStatus={selectedItem.status || 'draft'}
          scheduledAt={selectedItem.scheduledAt}
          onClose={() => setShowStatusModal(false)}
          onSave={handleStatusSave}
        />
      )}
    </PageLayout>
  );
}
