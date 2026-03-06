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
      <div className="w-[420px] rounded-xl bg-white shadow-xl p-6 space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Create Task</h2>
          <p className="text-sm text-gray-500 mt-1">
            Add a new task to your project
          </p>
        </div>

        <div className="space-y-3">
          <input
            placeholder="Task title"
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            placeholder="Description"
            rows={4}
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black resize-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-md border border-gray-200 hover:bg-gray-50 transition"
          >
            Cancel
          </button>

          <button
            onClick={submit}
            className="px-4 py-2 text-sm rounded-md bg-black text-white hover:bg-neutral-800 transition"
          >
            Create Task
          </button>
        </div>
      </div>
    </div>
  );
}
