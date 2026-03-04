"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import KanbanBoard from "@/components/dashboard/KanbanBoard";

const socket = io("http://localhost:3000");

export type Activity = {
  id: string;
  type: string;
  payload: {
    author?: string;
    message?: string;
    title?: string;
    url?: string;
  };
};

export type Task = {
  id: number;
  title: string;
  status: "BACKLOG" | "IN_PROGRESS" | "REVIEW" | "DONE";
  activities?: Activity[];
};

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    axios.get("http://localhost:3000/tasks").then((res) => setTasks(res.data));

    socket.on("task.updated", (data) => {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === data.taskId ? { ...task, status: data.status } : task
        )
      );
    });

    socket.on("task.created", (task) => {
      setTasks((prev) => [...prev, task]);
    });
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      <DashboardHeader />
      <KanbanBoard tasks={tasks} />
    </div>
  );
}
