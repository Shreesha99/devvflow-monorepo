import { Task } from "@/app/dashboard/page";
import ActivityItem from "./ActivityItem";

export default function TaskCard({ task }: { task: Task }) {
  return (
    <div className="bg-white p-3 mb-3 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition">
      <div className="font-medium text-sm mb-2">{task.title}</div>

      {task.activities && task.activities.length > 0 && (
        <div className="text-xs text-gray-500 space-y-1">
          {task.activities.slice(0, 3).map((a) => (
            <ActivityItem key={a.id} activity={a} />
          ))}
        </div>
      )}
    </div>
  );
}
