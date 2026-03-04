import { Task } from "@/app/dashboard/page";
import KanbanColumn from "./KanbanColumn";
import {
  ClipboardList,
  PlayCircle,
  GitPullRequest,
  CheckCircle,
} from "lucide-react";

export default function KanbanBoard({ tasks }: { tasks: Task[] }) {
  return (
    <div className="p-10 grid grid-cols-4 gap-6">
      <KanbanColumn
        title="BACKLOG"
        icon={<ClipboardList size={18} />}
        tasks={tasks.filter((t) => t.status === "BACKLOG")}
      />

      <KanbanColumn
        title="IN PROGRESS"
        icon={<PlayCircle size={18} />}
        tasks={tasks.filter((t) => t.status === "IN_PROGRESS")}
      />

      <KanbanColumn
        title="REVIEW"
        icon={<GitPullRequest size={18} />}
        tasks={tasks.filter((t) => t.status === "REVIEW")}
      />

      <KanbanColumn
        title="DONE"
        icon={<CheckCircle size={18} />}
        tasks={tasks.filter((t) => t.status === "DONE")}
      />
    </div>
  );
}
