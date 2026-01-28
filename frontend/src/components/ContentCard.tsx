import StatusBadge from './StatusBadge';
import { format } from 'date-fns';

interface ContentCardProps {
  id: number;
  title: string;
  subtitle?: string;
  status: 'draft' | 'scheduled' | 'published';
  scheduledAt?: string | null;
  createdAt: string;
  icon?: string;
  color?: string;
  onClick?: () => void;
  onStatusClick?: () => void;
}

export default function ContentCard({
  title,
  subtitle,
  status,
  scheduledAt,
  createdAt,
  icon,
  color = 'bg-primary-100',
  onClick,
  onStatusClick,
}: ContentCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        {icon && (
          <div className={`${color} w-10 h-10 rounded-lg flex items-center justify-center text-xl`}>
            {icon}
          </div>
        )}
        <div onClick={(e) => { e.stopPropagation(); onStatusClick?.(); }}>
          <StatusBadge status={status} size="sm" />
        </div>
      </div>

      <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">{title}</h3>
      {subtitle && (
        <p className="text-sm text-gray-500 line-clamp-1">{subtitle}</p>
      )}

      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
        <span>Created {format(new Date(createdAt), 'MMM d, yyyy')}</span>
        {status === 'scheduled' && scheduledAt && (
          <span className="text-yellow-600">
            Scheduled: {format(new Date(scheduledAt), 'MMM d, HH:mm')}
          </span>
        )}
      </div>
    </div>
  );
}
