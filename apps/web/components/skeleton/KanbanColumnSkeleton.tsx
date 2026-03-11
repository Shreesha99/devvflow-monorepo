import TaskCardSkeleton from "./TaskCardSkeleton";

export default function KanbanColumnSkeleton() {
  return (
    <div className="bg-card p-4 rounded-xl border border-border">
      <div className="h-4 w-24 bg-muted rounded mb-4 animate-pulse"></div>

      {Array.from({ length: 4 }).map((_, i) => (
        <TaskCardSkeleton key={i} />
      ))}
    </div>
  );
}
