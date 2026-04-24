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
  selected?: boolean;
  onSelect?: (id: number) => void;
  selectionMode?: boolean;
}

export default function ContentCard({
  id,
  title,
  subtitle,
  status,
  scheduledAt,
  createdAt,
  icon,
  color = 'bg-primary-50',
  onClick,
  onStatusClick,
  selected = false,
  onSelect,
  selectionMode = false,
}: ContentCardProps) {
  return (
    <div
      onClick={onClick}
      className={`group bg-white rounded-2xl border p-5 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 ${
        selected ? 'border-primary-400 ring-2 ring-primary-100' : 'border-gray-100'
      }`}
      style={{ boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.04)' }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 12px 0 rgb(0 0 0 / 0.08)')}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 1px 3px 0 rgb(0 0 0 / 0.04)')}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {(selectionMode || selected) && (
            <input
              type="checkbox"
              checked={selected}
              onChange={(e) => { e.stopPropagation(); onSelect?.(id); }}
              onClick={(e) => e.stopPropagation()}
              className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
          )}
          {icon && (
            <div className={`${color} w-10 h-10 rounded-xl flex items-center justify-center text-lg`}>
              {icon}
            </div>
          )}
        </div>
        <div onClick={(e) => { e.stopPropagation(); onStatusClick?.(); }}>
          <StatusBadge status={status} size="sm" />
        </div>
      </div>

      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 text-sm">{title}</h3>
      {subtitle && (
        <p className="text-xs text-gray-500 line-clamp-1">{subtitle}</p>
      )}

      <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
        <span>{format(new Date(createdAt), 'MMM d, yyyy')}</span>
        {status === 'scheduled' && scheduledAt && (
          <span className="text-amber-600 font-medium">
            {format(new Date(scheduledAt), 'MMM d, HH:mm')}
          </span>
        )}
      </div>
    </div>
  );
}
