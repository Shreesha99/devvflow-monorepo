"use client";

import { useEffect, useState } from "react";
import { getRepos, connectRepo } from "@/lib/github";
import { ChevronDown, FolderGit2 } from "lucide-react";
import SearchDropdown from "../ui/SearchDropdown";

type Repo = {
  id: number;
  name: string;
  fullName: string;
};

export default function RepoDropdown({
  currentRepo,
  onRepoChange,
}: {
  currentRepo: string;
  onRepoChange: (projectId: string, repoFullName: string) => void;
}) {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [open, setOpen] = useState(false);
  const [loadingRepos, setLoadingRepos] = useState(true);

  useEffect(() => {
    getRepos().then((data) => {
      setRepos(data);
      setLoadingRepos(false);
    });
  }, []);

  useEffect(() => {
    getRepos().then(setRepos);
  }, []);

  const selectRepo = async (repo: Repo) => {
    if (repo.fullName === currentRepo) {
      setOpen(false);
      return;
    }

    const [owner, name] = repo.fullName.split("/");

    const project = await connectRepo(owner, name);

    localStorage.setItem("connected_repo", repo.fullName);
    localStorage.setItem("connected_project", project.id);

    onRepoChange(project.id, repo.fullName);

    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-md bg-card hover:bg-muted text-sm text-foreground"
      >
        <FolderGit2 size={14} />
        <span className="truncate max-w-50">{currentRepo}</span>
        <ChevronDown size={14} />
      </button>

      {open && (
        <div className="absolute mt-2 w-72 z-50">
          {loadingRepos ? (
            <div className="bg-card border border-border rounded-lg shadow-lg p-4 space-y-2 animate-pulse">
              <div className="h-3 bg-muted rounded"></div>
              <div className="h-3 bg-muted rounded"></div>
              <div className="h-3 bg-muted rounded"></div>
              <div className="h-3 bg-muted rounded"></div>
            </div>
          ) : (
            <SearchDropdown
              items={repos.map((repo) => ({
                id: repo.id,
                label: repo.fullName,
                value: repo,
              }))}
              placeholder="Search repositories..."
              onSelect={(item) => selectRepo(item.value)}
            />
          )}
        </div>
      )}
    </div>
  );
}
