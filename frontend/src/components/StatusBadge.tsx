interface StatusBadgeProps {
  status: 'draft' | 'scheduled' | 'published';
  size?: 'sm' | 'md';
}

const statusConfig = {
  draft: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    dot: 'bg-gray-400',
    label: 'Draft',
  },
  scheduled: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-700',
    dot: 'bg-yellow-400',
    label: 'Scheduled',
  },
  published: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    dot: 'bg-green-400',
    label: 'Published',
  },
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span className={`inline-flex items-center gap-1.5 ${config.bg} ${config.text} ${sizeClasses} rounded-full font-medium`}>
      <span className={`w-2 h-2 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
