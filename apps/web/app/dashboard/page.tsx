"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

type Task = {
  id: number;
  title: string;
  status: "BACKLOG" | "IN_PROGRESS" | "REVIEW" | "DONE";
};

export default function Dashboard() {
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
    <div className="p-10 grid grid-cols-4 gap-6">
      <Column
        title="BACKLOG"
        tasks={tasks.filter((t) => t.status === "BACKLOG")}
      />

      <Column
        title="IN_PROGRESS"
        tasks={tasks.filter((t) => t.status === "IN_PROGRESS")}
      />

      <Column
        title="REVIEW"
        tasks={tasks.filter((t) => t.status === "REVIEW")}
      />

      <Column title="DONE" tasks={tasks.filter((t) => t.status === "DONE")} />
    </div>
  );
}

function Column({ title, tasks }: { title: string; tasks: Task[] }) {
  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <h2 className="font-bold mb-4">{title}</h2>

      {tasks.map((task) => (
        <div key={task.id} className="bg-white p-3 mb-3 rounded shadow">
          {task.title}
        </div>
      ))}
    </div>
  );
}
