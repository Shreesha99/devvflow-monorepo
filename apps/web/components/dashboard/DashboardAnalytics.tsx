"use client";

import { Task } from "@/app/dashboard/page";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { format, subDays } from "date-fns";
import {
  CheckCircle2,
  Activity,
  Loader2,
  ClipboardList,
  GitCommit,
  GitPullRequest,
  GitMerge,
} from "lucide-react";

const activityLabelMap: Record<string, string> = {
  commit_pushed: "Commit pushed",
  pull_request_opened: "PR opened",
  pull_request_merged: "PR merged",
  task_completed: "Task completed",
  "task.completed": "Task completed",
};

function getActivityIcon(type: string) {
  switch (type) {
    case "commit_pushed":
      return <GitCommit size={14} />;

    case "pull_request_opened":
      return <GitPullRequest size={14} />;

    case "pull_request_merged":
      return <GitMerge size={14} />;

    default:
      return <GitCommit size={14} />;
  }
}

export default function DevFlowAnalytics({ tasks }: { tasks: Task[] }) {
  const activities = tasks.flatMap((t) => t.activities || []);

  const status = {
    backlog: tasks.filter((t) => t.status === "BACKLOG").length,
    progress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
    review: tasks.filter((t) => t.status === "REVIEW").length,
    done: tasks.filter((t) => t.status === "DONE").length,
  };

  const pieData = [
    { name: "Backlog", value: status.backlog },
    { name: "In Progress", value: status.progress },
    { name: "Review", value: status.review },
    { name: "Done", value: status.done },
  ];

  const COLORS = ["#e5e7eb", "#3b82f6", "#f59e0b", "#10b981"];

  const last7Days = Array.from({ length: 7 }).map((_, i) =>
    format(subDays(new Date(), 6 - i), "MMM d")
  );

  const velocity = last7Days.map((day) => {
    const count = activities.filter((a) => {
      const d = format(new Date(a.createdAt), "MMM d");
      return d === day && a.type === "task.completed";
    }).length;

    return { day, tasks: count };
  });

  const contributors: Record<string, number> = {};

  activities.forEach((a) => {
    const author = a.payload?.author || "Unknown";
    contributors[author] = (contributors[author] || 0) + 1;
  });

  const leaderboard = Object.entries(contributors)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="space-y-10">
      {/* METRICS */}

      <div className="grid grid-cols-4 gap-6">
        <Metric
          title="Total Tasks"
          value={tasks.length}
          icon={<ClipboardList size={18} />}
        />

        <Metric
          title="Completed"
          value={status.done}
          icon={<CheckCircle2 size={18} />}
        />

        <Metric
          title="In Progress"
          value={status.progress}
          icon={<Loader2 size={18} />}
        />

        <Metric
          title="Activity Events"
          value={activities.length}
          icon={<Activity size={18} />}
        />
      </div>

      {/* CHARTS */}

      <div className="grid grid-cols-2 gap-6">
        <ChartCard title="Task Distribution">
          {tasks.length === 0 ? (
            <EmptyState
              title="No tasks yet"
              description="Create tasks to start tracking progress."
            />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={75}
                  outerRadius={100}
                  dataKey="value"
                  paddingAngle={3}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Weekly Throughput">
          {velocity.every((v) => v.tasks === 0) ? (
            <EmptyState
              title="No completed tasks"
              description="Throughput appears once tasks get completed."
            />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={velocity}>
                <XAxis dataKey="day" />

                <YAxis allowDecimals={false} />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="tasks"
                  stroke="#111827"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* LOWER */}

      <div className="grid grid-cols-2 gap-6">
        <ChartCard title="Top Contributors">
          {leaderboard.length === 0 ? (
            <EmptyState
              title="No contributors"
              description="GitHub activity will appear here."
            />
          ) : (
            <div className="space-y-4">
              {leaderboard.map((dev) => (
                <div
                  key={dev.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-foreground">
                      {dev.name.charAt(0)}
                    </div>

                    <span className="text-sm font-medium text-foreground">
                      {dev.name}
                    </span>
                  </div>

                  <span className="text-xs text-muted-foreground">
                    {dev.count} events
                  </span>
                </div>
              ))}
            </div>
          )}
        </ChartCard>

        <ChartCard title="Recent Activity">
          {activities.length === 0 ? (
            <EmptyState
              title="No activity yet"
              description="Commits and PR activity will appear here."
            />
          ) : (
            <div className="space-y-4 max-h-65 overflow-y-auto pr-2">
              {activities.slice(0, 10).map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between text-sm text-foreground"
                >
                  <div className="flex items-center gap-2">
                    {getActivityIcon(a.type)}
                    {activityLabelMap[a.type] || a.type}
                  </div>

                  <span className="text-xs text-muted-foreground">
                    {format(new Date(a.createdAt), "MMM d HH:mm")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </ChartCard>
      </div>
    </div>
  );
}

/* METRIC */

function Metric({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="bg-card border border-border rounded-xl p-6 flex justify-between items-start shadow-sm hover:shadow-md transition"
    >
      <div>
        <p className="text-xs text-muted-foreground">{title}</p>

        <p className="text-3xl font-semibold text-foreground mt-1">
          {value ?? "--"}
        </p>
      </div>

      <div className="text-muted-foreground">{icon}</div>
    </motion.div>
  );
}

/* CARD */

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-foreground mb-5">{title}</h3>

      {children}
    </div>
  );
}

/* EMPTY */

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-60 text-center">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>

      <p className="text-xs text-muted-foreground mt-2 max-w-60">
        {description}
      </p>
    </div>
  );
}
