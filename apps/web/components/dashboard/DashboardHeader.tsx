"use client";

import { LayoutDashboard, Github } from "lucide-react";
import RepoDropdown from "@/components/github/RepoDropdown";
import GithubAccountMenu from "../github/GithubAccountMenu";

export default function DashboardHeader({
  repo,
  githubConnected,
  onRepoChange,
  onLogoutGithub,
}: {
  repo?: string;
  githubConnected: boolean;
  onRepoChange: (projectId: string, repoFullName: string) => void;
  onLogoutGithub: () => void;
}) {
  return (
    <div className="border-b bg-white px-8 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 font-semibold text-lg">
          <LayoutDashboard size={18} />
          DevFlow
        </div>

        {repo && (
          <RepoDropdown currentRepo={repo} onRepoChange={onRepoChange} />
        )}
      </div>

      {githubConnected && <GithubAccountMenu onLogout={onLogoutGithub} />}
    </div>
  );
}
