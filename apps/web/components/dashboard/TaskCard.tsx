"use client";

import { useState } from "react";
import { Task } from "@/app/dashboard/page";
import ActivityItem from "./ActivityItem";
import { ChevronDown, ChevronUp, GripVertical } from "lucide-react";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

export default function TaskCard({ task }: { task: Task }) {
  const [expanded, setExpanded] = useState(false);
  const isLocked = task.status === "DONE";

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
      disabled: isLocked,
    });

  const style =
    transform && !isDragging
      ? {
          transform: CSS.Transform.toString(transform),
          transition: "transform 120ms ease",
        }
      : undefined;

  const activities = [...(task.activities || [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const preview = activities.slice(0, 2);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white p-3 mb-3 rounded-lg border border-gray-200 
      hover:border-gray-300 hover:shadow-sm transition
      ${isDragging ? "opacity-40" : ""}`}
    >
      {/* HEADER */}
      <div className="flex items-start gap-2 mb-2">
        {/* DRAG HANDLE */}
        <div
          {...(!isLocked ? listeners : {})}
          {...(!isLocked ? attributes : {})}
          className={`mt-0.5 ${
            isLocked
              ? "text-gray-300 cursor-not-allowed"
              : "text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
          }`}
        >
          <GripVertical size={16} />
        </div>

        <div className="flex flex-col">
          <span className="text-xs font-mono text-gray-500">
            TASK-{task.number ?? task.id}
          </span>

          <span className="text-sm font-medium text-gray-800">
            {task.title}
          </span>
        </div>
      </div>

      {/* ACTIVITY PREVIEW */}
      {activities.length > 0 && (
        <div className="text-xs text-gray-500 space-y-1">
          {preview.map((a) => (
            <ActivityItem key={`${a.id}-${a.createdAt}`} activity={a} />
          ))}

          {activities.length > 2 && !expanded && (
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => setExpanded(true)}
              className="flex items-center gap-1 text-gray-400 hover:text-gray-600 text-xs mt-1"
            >
              +{activities.length - 2} more
              <ChevronDown size={12} />
            </button>
          )}
        </div>
      )}

      {/* EXPANDED */}
      {expanded && (
        <div className="mt-2 border-t pt-2 space-y-1 text-xs text-gray-500">
          {activities.slice(2).map((a) => (
            <ActivityItem key={a.id} activity={a} />
          ))}

          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => setExpanded(false)}
            className="flex items-center gap-1 text-gray-400 hover:text-gray-600 text-xs mt-1"
          >
            Show less
            <ChevronUp size={12} />
          </button>
        </div>
      )}
    </div>
  );
}
