"use client";

import { useState } from "react";
import { Task } from "@/app/dashboard/page";
import ActivityItem from "./ActivityItem";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function TaskCard({ task }: { task: Task }) {
  const [expanded, setExpanded] = useState(false);

  const activities = [...(task.activities || [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const preview = activities.slice(0, 2);

  return (
    <div className="bg-white p-3 mb-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition">
      {/* Task title */}
      <div className="text-sm font-medium mb-2 text-gray-800">{task.title}</div>

      {/* Activity preview */}
      {activities.length > 0 && (
        <div className="text-xs text-gray-500 space-y-1">
          {preview.map((a) => (
            <ActivityItem key={a.id} activity={a} />
          ))}

          {/* Expand button */}
          {activities.length > 2 && !expanded && (
            <button
              onClick={() => setExpanded(true)}
              className="flex items-center gap-1 text-gray-400 hover:text-gray-600 text-xs mt-1"
            >
              +{activities.length - 2} more
              <ChevronDown size={12} />
            </button>
          )}
        </div>
      )}

      {/* Expanded activity list */}
      {expanded && (
        <div className="mt-2 border-t pt-2 space-y-1 text-xs text-gray-500">
          {activities.slice(2).map((a) => (
            <ActivityItem key={a.id} activity={a} />
          ))}

          <button
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
