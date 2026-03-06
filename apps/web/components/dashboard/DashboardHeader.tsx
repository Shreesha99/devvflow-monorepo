"use client";

import { LayoutDashboard, Github, ChevronDown } from "lucide-react";

export default function DashboardHeader({
  repo,
  onChangeRepo,
  onLogoutGithub,
}: {
  repo?: string;
  onChangeRepo: () => void;
  onLogoutGithub: () => void;
}) {
  return (
    <div className="border-b bg-white px-10 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2 font-semibold text-lg">
        <LayoutDashboard size={20} />
        DevFlow
      </div>

      <div className="flex items-center gap-4">
        {repo && (
          <button
            onClick={onChangeRepo}
            className="flex items-center gap-2 px-3 py-1 border rounded-md hover:bg-gray-100"
          >
            {repo}
            <ChevronDown size={14} />
          </button>
        )}

        <button
          onClick={onLogoutGithub}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-black"
        >
          <Github size={16} />
          Switch GitHub
        </button>
      </div>
    </div>
  );
}
