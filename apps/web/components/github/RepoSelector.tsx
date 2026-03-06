"use client";

import { useEffect, useState } from "react";
import { getRepos, connectRepo } from "@/lib/github";
import { Search, Lock, FolderGit2, SlidersHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import RepoSelectorSkeleton from "../skeleton/RepoSelectorSkeleton";
import toast from "react-hot-toast";

type Repo = {
  id: number;
  name: string;
  fullName: string;
  private: boolean;
  created_at: string;
  owner: {
    login: string;
    avatar_url: string;
    type: string;
  };
};

type SortOption = "name" | "private" | "public" | "age";

export default function RepoSelector({
  onConnected,
}: {
  onConnected: (projectId: string, repoFullName: string) => void;
}) {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("name");
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("github_token");
    if (!token) return;

    getRepos().then((data) => {
      setRepos(data);
      setLoading(false);
    });
  }, []);

  const selectRepo = async (repo: Repo) => {
    const [owner, name] = repo.fullName.split("/");

    try {
      const project = await connectRepo(owner, name);

      localStorage.setItem("connected_repo", repo.fullName);
      localStorage.setItem("connected_project", project.id);

      toast.success(`Connected ${repo.fullName}`);

      onConnected(project.id, repo.fullName);
    } catch (err: any) {
      console.error(err);

      toast.error(
        "Unable to connect repository. You may not have access to this repo."
      );
    }
  };

  let filteredRepos = repos.filter((repo) =>
    repo.fullName.toLowerCase().includes(query.toLowerCase())
  );

  switch (sort) {
    case "name":
      filteredRepos.sort((a, b) => a.fullName.localeCompare(b.fullName));
      break;

    case "private":
      filteredRepos = filteredRepos.filter((r) => r.private);
      break;

    case "public":
      filteredRepos = filteredRepos.filter((r) => !r.private);
      break;

    case "age":
      filteredRepos.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      break;
  }

  if (loading) {
    return <RepoSelectorSkeleton />;
  }

  return (
    <div className="bg-white border rounded-xl shadow-sm w-[640px] mx-auto flex flex-col h-[520px]">
      {/* Header */}
      <div className="p-6 border-b">
        <h2 className="font-semibold text-lg">Select Repository</h2>
        <p className="text-sm text-gray-500 mt-1">
          Choose a repository to connect with DevFlow
        </p>

        {/* Search + Filters */}
        <div className="mt-4 flex gap-2">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={query}
              onChange={(e) => {
                setSearching(true);
                setQuery(e.target.value);

                setTimeout(() => {
                  setSearching(false);
                }, 200);
              }}
              placeholder="Search repositories..."
              className="w-full pl-9 pr-3 py-2 text-sm border rounded-md outline-none focus:ring-2 focus:ring-gray-200"
            />
          </div>

          {/* Filter dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-3 py-2 text-sm border rounded-md hover:bg-gray-50">
                <SlidersHorizontal size={14} />
                Sort
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setSort("name")}>
                Sort by Name
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => setSort("private")}>
                Private Repositories
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => setSort("public")}>
                Public Repositories
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => setSort("age")}>
                Oldest First
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 relative">
        {/* Skeleton Layer */}
        <div
          className={`absolute inset-0 p-4 space-y-2 transition-opacity duration-200 ${
            searching ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="p-3 border rounded-md flex items-center justify-between animate-pulse"
            >
              <div className="flex items-center gap-2 w-full">
                <div className="w-4 h-4 bg-gray-200 rounded" />
                <div className="h-3 bg-gray-200 rounded w-[60%]" />
              </div>
            </div>
          ))}
        </div>

        {/* Repo Content Layer */}
        <div
          className={`space-y-2 transition-opacity duration-200 ${
            searching ? "opacity-0" : "opacity-100"
          }`}
        >
          {filteredRepos.map((repo) => (
            <div
              key={repo.id}
              onClick={() => selectRepo(repo)}
              className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer transition flex items-center justify-between"
            >
              <div className="flex items-center gap-3 min-w-0">
                {repo.private ? (
                  <Lock size={14} className="text-gray-500" />
                ) : (
                  <FolderGit2 size={14} className="text-gray-500" />
                )}

                <div className="flex flex-col min-w-0">
                  <span className="truncate font-medium">{repo.name}</span>
                  <span className="text-xs text-gray-400 truncate">
                    {repo.owner.login}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {filteredRepos.length === 0 && (
            <div className="text-sm text-gray-400 text-center py-6">
              No repositories found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
