"use client";

import { Task } from "@/app/dashboard/page";
import KanbanColumn from "./KanbanColumn";
import {
  ClipboardList,
  PlayCircle,
  GitPullRequest,
  CheckCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import axios from "axios";
import { useEffect, useState } from "react";
import TaskCard from "./TaskCard";
import toast from "react-hot-toast";

export default function KanbanBoard({ tasks }: { tasks: Task[] }) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
      },
    })
  );
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [boardTasks, setBoardTasks] = useState(tasks);

  useEffect(() => {
    setBoardTasks(tasks);
  }, [tasks]);

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) {
      setActiveTask(null);
      return;
    }

    const taskId = active.id;
    const newStatus = over.id as Task["status"];

    setBoardTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    requestAnimationFrame(() => {
      setActiveTask(null);
    });

    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/tasks/${taskId}/status`,
        { status: newStatus }
      );

      toast.success("Task moved successfully");
    } catch (err) {
      toast.error("Failed to update task");
    }
  }

  function handleDragStart(event: DragStartEvent) {
    const task = boardTasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="p-10 grid grid-cols-4 gap-6">
        <KanbanColumn
          id="BACKLOG"
          title="BACKLOG"
          icon={<ClipboardList size={18} />}
          tasks={boardTasks.filter((t) => t.status === "BACKLOG")}
        />

        <KanbanColumn
          id="IN_PROGRESS"
          title="IN PROGRESS"
          icon={<Loader2 size={18} />}
          tasks={boardTasks.filter((t) => t.status === "IN_PROGRESS")}
        />

        <KanbanColumn
          id="REVIEW"
          title="REVIEW"
          icon={<GitPullRequest size={18} />}
          tasks={boardTasks.filter((t) => t.status === "REVIEW")}
        />

        <KanbanColumn
          id="DONE"
          title="DONE"
          icon={<CheckCircle2 size={18} />}
          tasks={boardTasks.filter((t) => t.status === "DONE")}
        />
      </div>
      <DragOverlay>
        {activeTask ? (
          <div className="w-70">
            <TaskCard task={activeTask} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
