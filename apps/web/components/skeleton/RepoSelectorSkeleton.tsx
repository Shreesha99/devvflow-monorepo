export default function RepoSelectorSkeleton() {
  return (
    <div className="bg-white border rounded-xl shadow-sm w-160 mx-auto flex flex-col h-130 animate-pulse">
      {/* Header */}
      <div className="p-6 border-b space-y-2">
        <div className="h-5 w-40 bg-gray-200 rounded" />
        <div className="h-3 w-72 bg-gray-200 rounded" />

        {/* Search + Filter */}
        <div className="mt-4 flex gap-2">
          <div className="flex-1 h-9 bg-gray-200 rounded-md" />
          <div className="w-24 h-9 bg-gray-200 rounded-md" />
        </div>
      </div>

      {/* Repo List */}
      <div className="flex-1 overflow-hidden p-4 space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-11 bg-gray-200 rounded-md" />
        ))}
      </div>
    </div>
  );
}
