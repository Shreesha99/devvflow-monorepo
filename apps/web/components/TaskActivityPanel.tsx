"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { socket } from "@/lib/socket";

type Activity = {
  id: string;
  taskId: number;
  type: string;
  payload: {
    message?: string;
    author?: string;
    title?: string;
    url?: string;
  };
  createdAt: string;
};

type ActivityEvent = {
  taskId: number;
  activity: Activity;
};

type Props = {
  taskId: number;
};

export default function TaskActivityPanel({ taskId }: Props) {
  const [activities, setActivities] = useState<Activity[]>([]);

  // Load initial activity
  useEffect(() => {
    axios
      .get<Activity[]>(`http://localhost:3000/activity/task/${taskId}`)
      .then((res) => {
        setActivities(res.data);
      });
  }, [taskId]);

  // Listen for realtime updates
  useEffect(() => {
    const handler = (event: ActivityEvent) => {
      if (event.taskId === taskId) {
        setActivities((prev) => [event.activity, ...prev]);
      }
    };

    socket.on("activity.created", handler);

    return () => {
      socket.off("activity.created", handler);
    };
  }, [taskId]);

  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-semibold mb-3">Activity</h3>

      {activities.length === 0 && (
        <p className="text-sm text-gray-500">No activity yet</p>
      )}

      {activities.map((a) => (
        <div key={a.id} className="border-b py-2 text-sm">
          <strong className="text-gray-700">{a.type}</strong>

          <div className="text-xs text-gray-500 mt-1">
            {a.payload.message && <div>Message: {a.payload.message}</div>}
            {a.payload.author && <div>Author: {a.payload.author}</div>}
            {a.payload.title && <div>Title: {a.payload.title}</div>}

            {a.payload.url && (
              <div>
                URL:{" "}
                <a
                  href={a.payload.url}
                  target="_blank"
                  className="text-blue-500"
                >
                  {a.payload.url}
                </a>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
