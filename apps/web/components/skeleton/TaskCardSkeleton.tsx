export default function TaskCardSkeleton() {
  return (
    <div className="bg-white p-3 mb-3 rounded-lg border border-gray-200 animate-pulse">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-3 w-16 bg-gray-200 rounded"></div>
        <div className="h-3 w-40 bg-gray-200 rounded"></div>
      </div>

      <div className="space-y-2">
        <div className="h-2 w-3/4 bg-gray-200 rounded"></div>
        <div className="h-2 w-1/2 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}
