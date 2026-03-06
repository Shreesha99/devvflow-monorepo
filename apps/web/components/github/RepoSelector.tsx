"use client";

import { useEffect, useState } from "react";
import { getRepos, connectRepo } from "@/lib/github";

type Repo = {
  id: number;
  name: string;
  fullName: string;
  private: boolean;
};

export default function RepoSelector({
  onConnected,
}: {
  onConnected: (projectId: string, repoFullName: string) => void;
}) {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);

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

    const project = await connectRepo(owner, name);

    localStorage.setItem("connected_repo", repo.fullName);
    localStorage.setItem("connected_project", project.id);

    onConnected(project.id, repo.fullName);
  };

  if (loading) {
    return (
      <div className="bg-white border rounded-lg p-6">
        Loading repositories...
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg p-6 space-y-2">
      <h2 className="font-semibold mb-4">Select Repository</h2>

      {repos.map((repo) => (
        <div
          key={repo.id}
          onClick={() => selectRepo(repo)}
          className="p-3 border rounded-md hover:bg-gray-100 cursor-pointer"
        >
          {repo.fullName}
        </div>
      ))}
    </div>
  );
}
