import TaskCardSkeleton from "./TaskCardSkeleton";

export default function KanbanColumnSkeleton() {
  return (
    <div className="bg-gray-100 p-4 rounded-xl border border-gray-200">
      <div className="h-4 w-24 bg-gray-200 rounded mb-4 animate-pulse"></div>

      {Array.from({ length: 4 }).map((_, i) => (
        <TaskCardSkeleton key={i} />
      ))}
    </div>
  );
}
