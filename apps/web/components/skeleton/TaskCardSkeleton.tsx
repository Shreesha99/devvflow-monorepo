export default function TaskCardSkeleton() {
  return (
    <div className="bg-card p-3 mb-3 rounded-lg border border-border animate-pulse">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-3 w-16 bg-muted rounded"></div>
        <div className="h-3 w-40 bg-muted rounded"></div>
      </div>

      <div className="space-y-2">
        <div className="h-2 w-3/4 bg-muted rounded"></div>
        <div className="h-2 w-1/2 bg-muted rounded"></div>
      </div>
    </div>
  );
}
