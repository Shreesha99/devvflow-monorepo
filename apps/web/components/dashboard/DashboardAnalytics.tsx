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

  /* ---------------- VELOCITY ---------------- */

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

  /* ---------------- CONTRIBUTORS ---------------- */

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
    <div className="space-y-8">
      {/* KPI METRICS */}

      <div className="grid grid-cols-4 gap-6">
        <Metric title="Total Tasks" value={tasks.length} />

        <Metric title="Completed Tasks" value={status.done} />

        <Metric title="In Progress" value={status.progress} />

        <Metric title="Activity Events" value={activities.length} />
      </div>

      {/* MAIN CHARTS */}

      <div className="grid grid-cols-2 gap-6">
        {/* TASK DISTRIBUTION */}

        <ChartCard title="Task Distribution">
          {tasks.length === 0 ? (
            <EmptyState
              title="No tasks yet"
              description="Create tasks to start tracking project progress."
            />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={70}
                  outerRadius={100}
                  dataKey="value"
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

        {/* WEEKLY VELOCITY */}

        <ChartCard title="Weekly Task Throughput">
          {velocity.every((v) => v.tasks === 0) ? (
            <EmptyState
              title="No completed tasks yet"
              description="Velocity will appear once tasks start getting completed."
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
                  stroke="#000"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* LOWER SECTION */}

      <div className="grid grid-cols-2 gap-6">
        {/* CONTRIBUTORS */}

        <ChartCard title="Top Contributors">
          {leaderboard.length === 0 ? (
            <EmptyState
              title="No contributors yet"
              description="GitHub commits and PR activity will appear here."
            />
          ) : (
            <div className="space-y-3">
              {leaderboard.map((dev, i) => (
                <div
                  key={dev.name}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="font-medium text-gray-800">
                    {i + 1}. {dev.name}
                  </span>

                  <span className="text-gray-500">{dev.count} events</span>
                </div>
              ))}
            </div>
          )}
        </ChartCard>

        {/* ACTIVITY FEED */}

        <ChartCard title="Recent Activity">
          {activities.length === 0 ? (
            <EmptyState
              title="No activity yet"
              description="Commits, PR merges and updates will show here."
            />
          ) : (
            <div className="space-y-3 max-h-[260px] overflow-y-auto">
              {activities.slice(0, 10).map((a) => (
                <div
                  key={a.id}
                  className="flex justify-between text-sm text-gray-600"
                >
                  <span>{a.type}</span>

                  <span className="text-xs text-gray-400">
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

/* ---------------- COMPONENTS ---------------- */

function Metric({ title, value }: { title: string; value: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border rounded-xl p-6"
    >
      <p className="text-xs text-gray-500">{title}</p>

      <p className="text-3xl font-semibold text-gray-900 mt-1">
        {value ?? "--"}
      </p>
    </motion.div>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border rounded-xl p-6">
      <h3 className="text-sm font-semibold text-gray-800 mb-4">{title}</h3>

      {children}
    </div>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-[240px] text-center">
      <p className="text-sm text-gray-500 font-medium">{title}</p>

      <p className="text-xs text-gray-400 mt-1 max-w-[220px]">{description}</p>
    </div>
  );
}
