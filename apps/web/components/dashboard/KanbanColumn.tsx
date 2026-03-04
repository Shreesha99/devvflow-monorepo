import { Task } from "@/app/dashboard/page";
import TaskCard from "./TaskCard";

export default function KanbanColumn({
  title,
  tasks,
  icon,
}: {
  title: string;
  tasks: Task[];
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-gray-100 p-4 rounded-xl border border-gray-200">
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
