"use client";

import { useState } from "react";
import { Task } from "@/app/dashboard/page";
import ActivityItem from "./ActivityItem";
import { ChevronDown, ChevronUp, GripVertical } from "lucide-react";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import TaskDetailsModal from "../tasks/TaskDetailsModal";

export default function TaskCard({ task }: { task: Task }) {
  const [expanded, setExpanded] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

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
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`group relative bg-white mb-3 rounded-lg border border-gray-200
  hover:border-gray-300 hover:shadow-sm
  transition-all duration-200 ease-out
  ${isDragging ? "opacity-40" : ""}`}
      >
        <div className="flex">
          {/* LEFT SIDE (65%) */}
          <div className="flex-1 p-3">
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

          {/* RIGHT SIDE (35%) */}
          <div
            onClick={() => setShowDetails(true)}
            className="w-[25%] flex items-center justify-center border-l
      cursor-pointer relative
      transition-all
      group-hover:bg-linear-to-l
      group-hover:from-gray-100/80
      group-hover:to-transparent"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-400 group-hover:text-gray-600 transition"
            >
              <path d="M15 3h6v6" />
              <path d="M10 14 21 3" />
              <path d="M21 14v7h-7" />
              <path d="M3 10V3h7" />
            </svg>
          </div>
        </div>
      </div>

      {/* TASK DETAILS MODAL */}
      {showDetails && (
        <TaskDetailsModal task={task} onClose={() => setShowDetails(false)} />
      )}
    </>
  );
}
