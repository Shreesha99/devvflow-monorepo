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
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
      <div className="bg-white w-96 rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold">Create Task</h2>

        <input
          placeholder="Task title"
          className="w-full border rounded-md p-2 text-sm"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Description"
          className="w-full border rounded-md p-2 text-sm"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1 text-sm text-gray-600">
            Cancel
          </button>

          <button
            onClick={submit}
            className="px-4 py-1 bg-black text-white rounded-md text-sm"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
