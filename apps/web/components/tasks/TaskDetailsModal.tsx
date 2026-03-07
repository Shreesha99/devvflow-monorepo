"use client";

import { Task } from "@/app/dashboard/page";
import ActivityItem from "@/components/dashboard/ActivityItem";
import { X, ClipboardCopy, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

type Tab = "activity" | "commits" | "prs";

export default function TaskDetailsModal({
  task,
  onClose,
}: {
  task: Task;
  onClose: () => void;
}) {
  const [description, setDescription] = useState(
    (task as any).description || ""
  );

  const [tab, setTab] = useState<Tab>("activity");

  const activities = [...(task.activities || [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const commits = activities.filter((a) => a.type === "commit_pushed");

  const prs = activities.filter((a) => a.type.startsWith("pull_request"));

  const copyRef = () => {
    navigator.clipboard.writeText(`TASK-${task.number ?? task.id}`);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-230 max-h-[90vh] bg-white rounded-xl shadow-xl flex flex-col"
      >
        {/* HEADER */}

        <div className="flex items-start justify-between px-6 py-4 border-b">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
              <span>TASK-{task.number ?? task.id}</span>

              <button
                onClick={copyRef}
                className="text-gray-400 hover:text-gray-600"
              >
                <ClipboardCopy size={14} />
              </button>
            </div>

            <h2 className="text-lg font-semibold text-gray-900">
              {task.title}
            </h2>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* BODY */}

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {/* DESCRIPTION */}

            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-800">
                Description
              </h3>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full border border-gray-200 rounded-md p-3 text-sm outline-none focus:ring-2 focus:ring-black resize-none"
              />
            </section>

            {/* TABS */}

            <div className="flex gap-6 border-b text-sm text-gray-500">
              <Tab
                label="Activity"
                active={tab === "activity"}
                onClick={() => setTab("activity")}
              />

              <Tab
                label="Commits"
                active={tab === "commits"}
                onClick={() => setTab("commits")}
              />

              <Tab
                label="Pull Requests"
                active={tab === "prs"}
                onClick={() => setTab("prs")}
              />
            </div>

            {/* TAB CONTENT */}

            <div className="pt-4">
              {/* ACTIVITY */}

              {tab === "activity" && (
                <div className="space-y-2">
                  {activities.length === 0 ? (
                    <p className="text-sm text-gray-400">No activity yet</p>
                  ) : (
                    activities.map((a) => (
                      <ActivityItem key={a.id} activity={a} />
                    ))
                  )}
                </div>
              )}

              {/* COMMITS */}

              {tab === "commits" && (
                <div className="space-y-3">
                  {commits.length === 0 ? (
                    <p className="text-sm text-gray-400">No commits linked</p>
                  ) : (
                    commits.map((c: any) => (
                      <CommitItem key={c.id} commit={c} />
                    ))
                  )}
                </div>
              )}

              {/* PRS */}

              {tab === "prs" && (
                <div className="space-y-3">
                  {prs.length === 0 ? (
                    <p className="text-sm text-gray-400">No PRs linked</p>
                  ) : (
                    prs.map((pr: any) => (
                      <a
                        key={pr.id}
                        href={pr.payload?.url}
                        target="_blank"
                        className="block border rounded-md p-3 hover:bg-gray-50"
                      >
                        <div className="text-sm font-medium text-gray-800">
                          {pr.payload?.title}
                        </div>

                        <div className="text-xs text-gray-500 mt-1">
                          {pr.payload?.author}
                        </div>
                      </a>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* SIDEBAR */}

          <div className="w-55 border-l p-6 space-y-6">
            <InfoRow label="Status" value={task.status.replace("_", " ")} />

            <InfoRow label="Commits" value={`${commits.length}`} />

            <InfoRow label="Activity" value={`${activities.length}`} />

            {activities[0] && (
              <InfoRow
                label="Last updated"
                value={format(new Date(activities[0].createdAt), "MMM d HH:mm")}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CommitItem({ commit }: { commit: any }) {
  const [open, setOpen] = useState(false);

  const files = commit.payload?.files || [];

  return (
    <div className="border rounded-md overflow-hidden">
      {/* COMMIT HEADER */}

      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left px-3 py-3 hover:bg-gray-50"
      >
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-gray-800">
            {commit.payload?.message}
          </div>

          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>

        <div className="text-xs text-gray-500 mt-1">
          {commit.payload?.author} •{" "}
          {format(new Date(commit.createdAt), "MMM d HH:mm")}
        </div>

        {files.length > 0 && (
          <div className="text-xs text-gray-400 mt-1">
            {files.length} files changed
          </div>
        )}
      </button>

      {/* FILES CHANGED */}

      {open && files.length > 0 && (
        <div className="border-t bg-gray-50 text-xs font-mono">
          {files.map((file: any, i: number) => (
            <div
              key={i}
              className="flex justify-between px-3 py-2 border-b last:border-none"
            >
              <FileChange key={i} file={file} />
              <span>{file.path || file}</span>

              {file.additions !== undefined && (
                <span>
                  <span className="text-green-600">+{file.additions}</span>{" "}
                  <span className="text-red-500">-{file.deletions}</span>
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FileChange({ file }: { file: any }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b last:border-none">
      <button
        onClick={() => setOpen(!open)}
        className="flex justify-between w-full px-3 py-2 text-left"
      >
        <span>{file.path}</span>

        <span>
          <span className="text-green-600">+{file.additions}</span>{" "}
          <span className="text-red-500">-{file.deletions}</span>
        </span>
      </button>

      {open && file.patch && (
        <pre className="bg-black text-green-400 text-[11px] p-3 overflow-x-auto">
          {file.patch}
        </pre>
      )}
    </div>
  );
}

function Tab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`pb-2 ${
        active ? "text-black border-b-2 border-black" : "hover:text-gray-700"
      }`}
    >
      {label}
    </button>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <div className="text-xs text-gray-400">{label}</div>
      <div className="text-sm text-gray-800">{value}</div>
    </div>
  );
}
