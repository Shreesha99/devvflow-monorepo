"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import KanbanBoard from "@/components/dashboard/KanbanBoard";
import GithubConnectButton from "@/components/github/GithubConnectButton";
import RepoSelector from "@/components/github/RepoSelector";
import CreateTaskModal from "@/components/tasks/CreateTaskModal";

const socket = io("http://localhost:3000", {
  transports: ["websocket"],
});

export type Activity = {
  id: string;
  type: string;
  createdAt: string;
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
  number: number;
};

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [githubConnected, setGithubConnected] = useState(false);
  const [repoConnected, setRepoConnected] = useState(false);
  const [currentRepo, setCurrentRepo] = useState<string | null>(null);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [showCreateTask, setShowCreateTask] = useState(false);

  useEffect(() => {
    const repo = localStorage.getItem("connected_repo");
    const projectId = localStorage.getItem("connected_project");

    if (repo && projectId) {
      setCurrentRepo(repo);
      setCurrentProjectId(projectId);
      setRepoConnected(true);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const repo = localStorage.getItem("connected_repo");

    if (repo) {
      setRepoConnected(true);
    }

    if (token) {
      localStorage.setItem("github_token", token);

      setGithubConnected(true);

      window.history.replaceState({}, "", "/dashboard");
    }

    const storedToken = localStorage.getItem("github_token");

    if (storedToken) {
      setGithubConnected(true);
    }
  }, []);

  useEffect(() => {
    if (!currentProjectId) return;

    axios
      .get(`http://localhost:3000/tasks/project/${currentProjectId}`)
      .then((res) => setTasks(res.data));
  }, [currentProjectId]);

  useEffect(() => {
    const handleTaskCreated = (task: any) => {
      // only add tasks belonging to the current project
      if (task.projectId === currentProjectId) {
        setTasks((prev) => [task, ...prev]);
      }
    };

    socket.on("task.created", handleTaskCreated);

    return () => {
      socket.off("task.created", handleTaskCreated);
    };
  }, [currentProjectId]);

  useEffect(() => {
    const handleTaskUpdated = (data: {
      taskId: number;
      status: Task["status"];
    }) => {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === data.taskId ? { ...task, status: data.status } : task
        )
      );
    };

    socket.on("task.updated", handleTaskUpdated);

    return () => {
      socket.off("task.updated", handleTaskUpdated);
    };
  }, []);

  useEffect(() => {
    const handleActivityCreated = (data: {
      taskId: number;
      activity: Activity;
    }) => {
      setTasks((prev) =>
        prev.map((task) => {
          if (task.id !== data.taskId) return task;

          const existing = task.activities?.some(
            (a) => a.id === data.activity.id
          );

          if (existing) return task;

          return {
            ...task,
            activities: [data.activity, ...(task.activities || [])],
          };
        })
      );
    };

    socket.on("activity.created", handleActivityCreated);

    return () => {
      socket.off("activity.created", handleActivityCreated);
    };
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      <DashboardHeader
        repo={currentRepo || undefined}
        onChangeRepo={() => {
          localStorage.removeItem("connected_repo");
          localStorage.removeItem("connected_project");

          setRepoConnected(false);
          setCurrentRepo(null);
          setCurrentProjectId(null);
        }}
        onLogoutGithub={() => {
          localStorage.removeItem("github_token");
          localStorage.removeItem("connected_repo");
          window.location.reload();
        }}
      />

      <div className="p-8 space-y-6">
        {!githubConnected && <GithubConnectButton />}

        {githubConnected && !repoConnected && (
          <RepoSelector
            onConnected={(projectId, repoFullName) => {
              setCurrentProjectId(projectId);
              setCurrentRepo(repoFullName);
              setRepoConnected(true);
            }}
          />
        )}

        {repoConnected && (
          <div className="flex justify-end">
            <button
              onClick={() => setShowCreateTask(true)}
              className="px-4 py-2 bg-black text-white rounded-md text-sm"
            >
              + New Task
            </button>
          </div>
        )}

        {repoConnected && <KanbanBoard tasks={tasks} />}

        {showCreateTask && currentProjectId && (
          <CreateTaskModal
            projectId={currentProjectId}
            onClose={() => setShowCreateTask(false)}
          />
        )}
      </div>
    </div>
  );
}
