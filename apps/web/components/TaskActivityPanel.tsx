"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { io, Socket } from "socket.io-client";

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

  useEffect(() => {
    axios
      .get<Activity[]>(`http://localhost:3000/activity/task/${taskId}`)
      .then((res) => {
        setActivities(res.data);
      });
  }, [taskId]);

  useEffect(() => {
    const socket: Socket = io("http://localhost:3000");

    socket.on("activity.created", (event: ActivityEvent) => {
      if (event.taskId === taskId) {
        setActivities((prev) => [event.activity, ...prev]);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [taskId]);

  return (
    <div style={{ border: "1px solid #ddd", padding: 16 }}>
      <h3>Activity</h3>

      {activities.length === 0 && <p>No activity yet</p>}

      {activities.map((a) => (
        <div
          key={a.id}
          style={{
            borderBottom: "1px solid #eee",
            padding: "8px 0",
          }}
        >
          <strong>{a.type}</strong>

          <div style={{ fontSize: 12 }}>
            {a.payload.message && <div>Message: {a.payload.message}</div>}
            {a.payload.author && <div>Author: {a.payload.author}</div>}
            {a.payload.title && <div>Title: {a.payload.title}</div>}
            {a.payload.url && (
              <div>
                URL:{" "}
                <a href={a.payload.url} target="_blank">
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
