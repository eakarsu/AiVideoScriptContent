import { useState, useEffect } from 'react';
import PageLayout from '../components/PageLayout';
import { ContentBarChart, ContentPieChart, ContentLineChart, StatCard } from '../components/AnalyticsChart';
import { api, FEATURES } from '../services/api';
import { format, subDays } from 'date-fns';

interface ContentCounts {
  [key: string]: number;
}

interface StatusCounts {
  draft: number;
  scheduled: number;
  published: number;
}

interface ActivityData {
  date: string;
  count: number;
  [key: string]: string | number;
}

export default function AnalyticsDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [contentCounts, setContentCounts] = useState<ContentCounts>({});
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({ draft: 0, scheduled: 0, published: 0 });
  const [recentActivity, setRecentActivity] = useState<ActivityData[]>([]);
  const [platformCounts, setPlatformCounts] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const counts: ContentCounts = {};
      const statuses: StatusCounts = { draft: 0, scheduled: 0, published: 0 };
      const platforms: Record<string, number> = {};
      const activityMap: Record<string, number> = {};

      // Initialize last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = format(subDays(new Date(), i), 'MMM d');
        activityMap[date] = 0;
      }

      // Fetch data from each feature endpoint
      await Promise.all(
        FEATURES.map(async (feature) => {
          try {
            const response = await api.get(feature.endpoint);
            const items = response.data;
            counts[feature.id] = items.length;

            // Count statuses
            items.forEach((item: any) => {
              if (item.status === 'draft') statuses.draft++;
              else if (item.status === 'scheduled') statuses.scheduled++;
              else if (item.status === 'published') statuses.published++;
              else statuses.draft++; // Default to draft if no status

              // Count platforms
              if (item.platform) {
                platforms[item.platform] = (platforms[item.platform] || 0) + 1;
              }

              // Count activity
              if (item.createdAt) {
                const date = format(new Date(item.createdAt), 'MMM d');
                if (activityMap[date] !== undefined) {
                  activityMap[date]++;
                }
              }
            });
          } catch {
            counts[feature.id] = 0;
          }
        })
      );

      setContentCounts(counts);
      setStatusCounts(statuses);
      setPlatformCounts(
        Object.entries(platforms).map(([name, value]) => ({ name, value }))
      );
      setRecentActivity(
        Object.entries(activityMap).map(([date, count]) => ({ date, count }))
      );
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalItems = Object.values(contentCounts).reduce((a, b) => a + b, 0);
  const totalPublished = statusCounts.published;
  const totalScheduled = statusCounts.scheduled;

  const contentTypeData = FEATURES.slice(0, 8).map((f) => ({
    name: f.name.split(' ')[0],
    value: contentCounts[f.id] || 0,
  }));

  const statusData = [
    { name: 'Draft', value: statusCounts.draft },
    { name: 'Scheduled', value: statusCounts.scheduled },
    { name: 'Published', value: statusCounts.published },
  ].filter((d) => d.value > 0);

  if (loading) {
    return (
      <PageLayout title="Analytics Dashboard" icon="📊">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading analytics...</div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Analytics Dashboard" subtitle="Overview of your content performance" icon="📊">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Content"
          value={totalItems}
          icon="📁"
          change={totalItems > 0 ? '+100%' : undefined}
          changeType="positive"
        />
        <StatCard
          title="Published"
          value={totalPublished}
          icon="✅"
          change={totalPublished > 0 ? `${Math.round((totalPublished / totalItems) * 100)}%` : undefined}
          changeType="positive"
        />
        <StatCard
          title="Scheduled"
          value={totalScheduled}
          icon="📅"
          change={totalScheduled > 0 ? `${totalScheduled} pending` : undefined}
          changeType="neutral"
        />
        <StatCard
          title="Content Types"
          value={Object.keys(contentCounts).filter((k) => contentCounts[k] > 0).length}
          icon="🎨"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ContentBarChart
          data={contentTypeData}
          title="Content by Type"
          height={300}
        />
        {statusData.length > 0 ? (
          <ContentPieChart
            data={statusData}
            title="Content Status Distribution"
            height={300}
          />
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Content Status Distribution</h3>
            <div className="flex items-center justify-center h-[268px] text-gray-400">
              No content yet
            </div>
          </div>
        )}
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ContentLineChart
          data={recentActivity}
          title="Creation Activity (Last 7 Days)"
          lines={[{ key: 'count', color: '#6366f1', name: 'Items Created' }]}
          height={300}
        />
        {platformCounts.length > 0 ? (
          <ContentPieChart
            data={platformCounts}
            title="Platform Distribution"
            height={300}
          />
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Platform Distribution</h3>
            <div className="flex items-center justify-center h-[268px] text-gray-400">
              No platform data yet
            </div>
          </div>
        )}
      </div>

      {/* Content Breakdown */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Content Breakdown</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {FEATURES.map((feature) => (
            <div
              key={feature.id}
              className="bg-gray-50 rounded-lg p-4 flex items-center gap-3"
            >
              <span className="text-2xl">{feature.icon}</span>
              <div>
                <p className="text-2xl font-bold text-gray-900">{contentCounts[feature.id] || 0}</p>
                <p className="text-xs text-gray-500">{feature.name.split(' ')[0]}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
