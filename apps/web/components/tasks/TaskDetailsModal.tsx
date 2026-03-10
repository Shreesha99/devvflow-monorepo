"use client";

import { Task } from "@/app/dashboard/page";
import ActivityItem from "@/components/dashboard/ActivityItem";
import {
  X,
  ClipboardCopy,
  ChevronDown,
  ChevronUp,
  Github,
  Link,
} from "lucide-react";
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
  const prsMap = new Map();

  activities
    .filter((a) => a.type.startsWith("pull_request"))
    .forEach((a) => {
      const key = a.payload?.branch || a.payload?.headSha;

      if (!key) return;

      const existing = prsMap.get(key);

      if (!existing) {
        prsMap.set(key, a);
        return;
      }

      if (new Date(a.createdAt) > new Date(existing.createdAt)) {
        prsMap.set(key, a);
      }
    });

  const prs = Array.from(prsMap.values());

  const copyRef = () => {
    navigator.clipboard.writeText(`TASK-${task.number ?? task.id}`);
  };

  const repoUrl =
    activities.find((a) => a.payload?.url)?.payload?.url?.split("/pull")[0] ||
    activities.find((a) => a.payload?.url)?.payload?.url?.split("/commit")[0];

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

        {/* HEADER */}

        <div className="flex items-start justify-between px-6 py-4 border-b">
          <div className="space-y-1">
            {/* meta row */}
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <div className="flex items-center gap-2 font-mono">
                <span>TASK-{task.number ?? task.id}</span>

                <button
                  onClick={copyRef}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ClipboardCopy size={14} />
                </button>
              </div>

              {repoUrl && (
                <>
                  <span className="text-gray-300">|</span>

                  <a
                    href={repoUrl}
                    target="_blank"
                    className="flex items-center gap-1 hover:text-gray-700"
                  >
                    <Github size={14} />
                    Repository
                  </a>
                </>
              )}
            </div>

            {/* title */}
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
          {/* LEFT SIDE */}
          <div className="flex flex-col flex-1 min-w-0">
            {/* TOP FIXED AREA */}
            <div className="p-6 space-y-6 border-b">
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
            </div>

            {/* SCROLLABLE TAB CONTENT */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 pt-4">
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

              {tab === "commits" && (
                <div className="space-y-3">
                  {commits.length === 0 ? (
                    <p className="text-sm text-gray-400">No commits linked</p>
                  ) : (
                    commits.map((c: any) => (
                      <CommitItem key={c.id} commit={c} prs={prs} />
                    ))
                  )}
                </div>
              )}

              {tab === "prs" && (
                <div className="space-y-3">
                  {prs.length === 0 ? (
                    <p className="text-sm text-gray-400">No PRs linked</p>
                  ) : (
                    prs.map((pr: any) => {
                      const status = pr.payload?.status;

                      const color =
                        status === "merged"
                          ? "bg-purple-100 text-purple-700"
                          : status === "open"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600";

                      const source = pr.payload?.branch || "feature";
                      const target = "main";

                      return (
                        <a
                          key={pr.id}
                          href={pr.payload?.url}
                          target="_blank"
                          className="group block border rounded-lg p-4 hover:border-gray-300 hover:shadow-sm transition bg-white"
                        >
                          <div className="flex items-start justify-between">
                            <div className="space-y-2 min-w-0">
                              <div className="flex items-center gap-2">
                                <Github size={14} className="text-gray-400" />

                                <span className="text-sm font-semibold text-gray-900 group-hover:underline">
                                  {pr.payload?.title}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
                                <span className="px-2 py-0.5 bg-gray-100 rounded">
                                  {source}
                                </span>

                                <span>→</span>

                                <span className="px-2 py-0.5 bg-gray-100 rounded">
                                  {target}
                                </span>
                              </div>

                              <div className="text-xs text-gray-400">
                                Pull request
                              </div>
                            </div>

                            <span
                              className={`px-2 py-1 text-xs rounded-full font-medium ${color}`}
                            >
                              {status}
                            </span>
                          </div>
                        </a>
                      );
                    })
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

function CommitItem({ commit, prs }: { commit: any; prs: any[] }) {
  const [open, setOpen] = useState(false);

  const files = commit.payload?.files || [];

  const message = commit.payload?.message || "";

  const isMergeCommit =
    message.startsWith("Merge pull request") ||
    message.startsWith("Merge branch");

  const shortSha = commit.payload?.sha?.slice(0, 7);

  const pr =
    prs.find((p) => p.payload?.branch === commit.payload?.branch) ||
    prs.find((p) => p.payload?.headSha === commit.payload?.sha);

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left px-3 py-3 hover:bg-gray-50"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
            {isMergeCommit && (
              <span className="px-2 py-0.5 text-[10px] rounded bg-purple-100 text-purple-700">
                MERGE
              </span>
            )}

            <span>{message}</span>

            {shortSha && (
              <span className="text-gray-400 font-mono text-xs">
                {shortSha}
              </span>
            )}
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

      <PRStatus pr={pr?.payload} />

      {open && files.length > 0 && (
        <div className="border-t bg-gray-50 text-xs font-mono">
          {files.map((file: any, i: number) => (
            <FileChange key={i} file={file} />
          ))}
        </div>
      )}
    </div>
  );
}

function FileChange({ file }: { file: any }) {
  const [open, setOpen] = useState(false);

  const lines: string[] = file.patch ? file.patch.split("\n") : [];

  return (
    <div className="border-b last:border-none bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-4 py-2 text-left hover:bg-gray-50 transition"
      >
        <div className="flex items-center gap-3 text-[12px]">
          <span className="font-medium text-gray-700">{file.path}</span>

          <span className="text-green-600 font-mono">+{file.additions}</span>
          <span className="text-red-600 font-mono">-{file.deletions}</span>
        </div>

        <div className="text-gray-400">
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>

      {open && lines.length > 0 && (
        <div className="border-t bg-neutral-900 text-[11px] font-mono">
          <div className="max-h-105 overflow-auto">
            <div className="flex min-w-max">
              {/* line numbers */}
              <div className="bg-neutral-800 text-gray-400 text-right px-3 py-2 select-none">
                {lines.map((_, i) => (
                  <div key={i} className="leading-5">
                    {i + 1}
                  </div>
                ))}
              </div>

              {/* code */}
              <div className="flex-1 py-2">
                {lines.map((line, i) => {
                  let style = "";

                  if (line.startsWith("+"))
                    style = "bg-green-950 text-green-300";
                  else if (line.startsWith("-"))
                    style = "bg-red-950 text-red-300";
                  else if (line.startsWith("@@"))
                    style = "bg-neutral-800 text-gray-300";

                  return (
                    <div
                      key={i}
                      className={`px-4 whitespace-pre leading-5 ${style}`}
                    >
                      {line}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
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

function PRStatus({ pr }: { pr?: any }) {
  if (!pr) {
    return (
      <div className="px-3 py-2 text-xs text-gray-400 flex items-center gap-2">
        No PR linked
      </div>
    );
  }

  const color =
    pr.status === "merged"
      ? "bg-purple-100 text-purple-700"
      : pr.status === "open"
        ? "bg-green-100 text-green-700"
        : "bg-gray-100 text-gray-600";

  return (
    <div className="px-3 py-2 flex items-center gap-3 text-xs">
      <div className="flex flex-col">
        <a
          href={pr.url}
          target="_blank"
          className="font-medium text-gray-800 hover:underline"
        >
          {pr.title}
        </a>

        <div className="text-gray-500 text-[11px] mt-0.5">
          {pr.branch || "unknown"} → main
        </div>
      </div>

      <span className={`px-2 py-0.5 rounded ${color}`}>{pr.status}</span>

      {pr.reviews && (
        <span className="text-gray-500">{pr.reviews} reviews</span>
      )}
    </div>
  );
}
