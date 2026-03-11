import KanbanColumnSkeleton from "./KanbanColumnSkeleton";

export default function KanbanBoardSkeleton() {
  return (
    <div className="p-10 grid grid-cols-4 gap-6 bg-background">
      <KanbanColumnSkeleton />
      <KanbanColumnSkeleton />
      <KanbanColumnSkeleton />
      <KanbanColumnSkeleton />
    </div>
  );
}
