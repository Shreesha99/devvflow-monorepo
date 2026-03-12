"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import KanbanBoard from "@/components/dashboard/KanbanBoard";
import GithubConnectButton from "@/components/github/GithubConnectButton";
import RepoSelector from "@/components/github/RepoSelector";
import CreateTaskModal from "@/components/tasks/CreateTaskModal";
import KanbanBoardSkeleton from "@/components/skeleton/KanbanBoardSkeleton";
import Sidebar from "@/components/layout/Sidebar";
import DashboardAnalytics from "@/components/dashboard/DashboardAnalytics";
import DashboardAnalyticsSkeleton from "@/components/skeleton/DashboardAnalyticsSkeleton";

const socket = io(process.env.NEXT_PUBLIC_API_URL!, {
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
    sha?: string;
    branch?: string;
    files?: {
      path: string;
      additions: number;
      deletions: number;
      patch?: string;
    }[];
    status?: "open" | "closed" | "merged";
    headSha?: string;
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
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [view, setView] = useState<
    "dashboard" | "kanban" | "activity" | "settings"
  >(() => {
    if (typeof window !== "undefined") {
      return (
        (localStorage.getItem("dashboard_view") as
          | "dashboard"
          | "kanban"
          | "activity"
          | "settings") || "dashboard"
      );
    }
    return "dashboard";
  });

  useEffect(() => {
    localStorage.setItem("dashboard_view", view);
  }, [view]);

  useEffect(() => {
    const token = localStorage.getItem("github_token");

    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, []);

  useEffect(() => {
    const repo = localStorage.getItem("connected_repo");
    const projectId = localStorage.getItem("connected_project");
    const token = localStorage.getItem("github_token");

    if (token) setGithubConnected(true);

    if (repo && projectId) {
      setCurrentRepo(repo);
      setCurrentProjectId(projectId);
      setRepoConnected(true);
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      if (code) {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/exchange?code=${code}`
          );

          const data = await res.json();

          if (data?.token) {
            localStorage.setItem("github_token", data.token);

            setGithubConnected(true);

            window.history.replaceState({}, "", "/dashboard");
            return;
          }
        } catch (e) {
          console.error(e);
        }
      }

      const token = localStorage.getItem("github_token");

      if (token) {
        setGithubConnected(true);
      }

      const repo = localStorage.getItem("connected_repo");
      const projectId = localStorage.getItem("connected_project");

      if (repo && projectId) {
        setRepoConnected(true);
        setCurrentRepo(repo);
        setCurrentProjectId(projectId);
      }
    };

    initAuth();
  }, []);

  useEffect(() => {
    if (!currentProjectId) return;

    const fetchTasks = async () => {
      try {
        setLoadingTasks(true);

        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/tasks/project/${currentProjectId}`
        );

        setTasks(res.data);
      } catch (err) {
      } finally {
        setLoadingTasks(false);
      }
    };

    fetchTasks();
  }, [currentProjectId]);

  useEffect(() => {
    const handleTaskCreated = (task: any) => {
      if (task.projectId === currentProjectId) {
        setTasks((prev) => [...prev, task]);
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
    <div
      className="h-screen flex flex-col overflow-hidden bg-background dashboard-gradient relative"
      style={{
        backgroundImage:
          "radial-gradient(circle at 20% 10%, rgba(29,99,216,0.08), transparent 40%), radial-gradient(circle at 80% 80%, rgba(122,57,200,0.06), transparent 40%)",
      }}
    >
      <div className="dashboard-glow">
        <div className="glow-blob glow-blue blob-1" />
        <div className="glow-blob glow-purple blob-2" />
      </div>
      <DashboardHeader
        repo={currentRepo || undefined}
        githubConnected={githubConnected}
        onRepoChange={(projectId, repoFullName) => {
          setCurrentProjectId(projectId);
          setCurrentRepo(repoFullName);
        }}
        onLogoutGithub={() => {
          localStorage.removeItem("github_token");
          localStorage.removeItem("connected_repo");
          window.location.reload();
        }}
      />

      <div className="flex flex-1 overflow-hidden">
        {repoConnected && (
          <Sidebar
            collapsed={sidebarCollapsed}
            toggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            active={view}
            onNavigate={setView}
          />
        )}

        <div className="flex-1 p-8 overflow-y-auto">
          {!githubConnected && (
            <div className="flex items-center justify-center h-[70vh]">
              <GithubConnectButton />
            </div>
          )}

          {githubConnected && !repoConnected && (
            <div className="flex items-center justify-center h-[70vh]">
              <RepoSelector
                onConnected={(projectId, repoFullName) => {
                  setCurrentProjectId(projectId);
                  setCurrentRepo(repoFullName);
                  setRepoConnected(true);
                }}
              />
            </div>
          )}

          {repoConnected && view === "kanban" && (
            <div className="flex items-center justify-between px-4">
              <h2 className="text-lg font-semibold text-foreground">
                {currentRepo}
              </h2>

              <button
                onClick={() => setShowCreateTask(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition"
              >
                <span className="text-lg leading-none">+</span>
                New Task
              </button>
            </div>
          )}

          {repoConnected && view === "dashboard" && (
            <div className="relative">
              <div
                className={`transition-opacity duration-300 ${
                  loadingTasks
                    ? "opacity-100"
                    : "opacity-0 pointer-events-none absolute inset-0"
                }`}
              >
                <DashboardAnalyticsSkeleton />
              </div>

              <div
                className={`transition-opacity duration-300 ${
                  loadingTasks ? "opacity-0" : "opacity-100"
                }`}
              >
                <DashboardAnalytics tasks={tasks} />
              </div>
            </div>
          )}

          {repoConnected && view === "kanban" && (
            <div className="relative">
              <div
                className={`transition-opacity duration-300 ${
                  loadingTasks
                    ? "opacity-100"
                    : "opacity-0 pointer-events-none absolute inset-0"
                }`}
              >
                <KanbanBoardSkeleton />
              </div>

              <div
                className={`transition-opacity duration-300 ${
                  loadingTasks ? "opacity-0" : "opacity-100"
                }`}
              >
                <KanbanBoard tasks={tasks} />
              </div>
            </div>
          )}

          {repoConnected && view === "activity" && (
            <div className="text-sm text-muted-foreground">
              Activity view coming soon
            </div>
          )}

          {repoConnected && view === "settings" && (
            <div className="text-sm text-muted-foreground">
              Settings view coming soon
            </div>
          )}

          {showCreateTask && currentProjectId && (
            <CreateTaskModal
              projectId={currentProjectId}
              onClose={() => setShowCreateTask(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
