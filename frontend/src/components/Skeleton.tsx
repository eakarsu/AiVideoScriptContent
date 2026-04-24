export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-gray-100" />
        <div className="w-16 h-5 rounded-lg bg-gray-100" />
      </div>
      <div className="h-4 w-3/4 bg-gray-100 rounded mb-2" />
      <div className="h-3 w-1/2 bg-gray-100 rounded" />
      <div className="mt-4 pt-3 border-t border-gray-50">
        <div className="h-3 w-24 bg-gray-100 rounded" />
      </div>
    </div>
  );
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
