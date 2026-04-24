interface StatusBadgeProps {
  status: 'draft' | 'scheduled' | 'published';
  size?: 'sm' | 'md';
}

const statusConfig = {
  draft: {
    bg: 'bg-gray-50',
    text: 'text-gray-600',
    dot: 'bg-gray-400',
    label: 'Draft',
  },
  scheduled: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-400',
    label: 'Scheduled',
  },
  published: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-400',
    label: 'Published',
  },
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];
  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span className={`inline-flex items-center gap-1.5 ${config.bg} ${config.text} ${sizeClasses} rounded-lg font-medium`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
