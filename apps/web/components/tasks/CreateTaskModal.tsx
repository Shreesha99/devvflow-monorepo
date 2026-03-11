"use client";

import { useState } from "react";
import { createTask } from "@/lib/tasks";

export default function CreateTaskModal({
  projectId,
  onClose,
}: {
  projectId: string;
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const submit = async () => {
    if (!title) return;

    await createTask({
      title,
      description,
      projectId,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-105 rounded-xl bg-card border border-border shadow-xl p-6 space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Create Task</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Add a new task to your project
          </p>
        </div>

        <div className="space-y-3">
          <input
            placeholder="Task title"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            placeholder="Description"
            rows={4}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-md border border-border hover:bg-muted transition"
          >
            Cancel
          </button>

          <button
            onClick={submit}
            className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:opacity-90 transition"
          >
            Create Task
          </button>
        </div>
      </div>
    </div>
  );
}
