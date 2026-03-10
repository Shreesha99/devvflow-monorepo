export default function RepoSelectorSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl shadow-sm w-160 mx-auto flex flex-col h-130 animate-pulse">
      {/* Header */}
      <div className="p-6 border-b border-border space-y-2">
        <div className="h-5 w-40 bg-muted rounded" />
        <div className="h-3 w-72 bg-muted rounded" />

        {/* Search + Filter */}
        <div className="mt-4 flex gap-2">
          <div className="flex-1 h-9 bg-muted rounded-md" />
          <div className="w-24 h-9 bg-muted rounded-md" />
        </div>
      </div>

      {/* Repo List */}
      <div className="flex-1 overflow-hidden p-4 space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-11 bg-muted rounded-md" />
        ))}
      </div>
    </div>
  );
}
