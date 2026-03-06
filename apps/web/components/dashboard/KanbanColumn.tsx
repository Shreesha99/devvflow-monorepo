"use client";

import { Task } from "@/app/dashboard/page";
import TaskCard from "./TaskCard";
import { TaskStatus } from "../../../../packages/database/generated/client";
import { useDroppable } from "@dnd-kit/core";

export default function KanbanColumn({
  id,
  title,
  tasks,
  icon,
}: {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  icon: React.ReactNode;
}) {
  const { setNodeRef } = useDroppable({
    id: id,
  });

  return (
    <div
      ref={setNodeRef}
      className="bg-gray-100 p-4 rounded-xl border border-gray-200"
    >
      <div className="flex items-center gap-2 mb-4 font-semibold text-gray-700">
        {icon}
        {title}
      </div>

      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}
