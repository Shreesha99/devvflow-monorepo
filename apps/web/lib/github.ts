import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function getRepos(page: number = 1, limit: number = 30) {
  const res = await axios.get(`${API}/webhooks/github/repos`, {
    params: { page, limit },
  });

  return res.data.map((repo: any) => ({
    ...repo,
    owner: repo.owner ?? {
      login: repo.fullName?.split("/")[0] ?? "unknown",
      avatar_url: "",
      type: "User",
    },
  }));
}

export async function connectRepo(owner: string, repo: string) {
  const res = await axios.patch(`${API}/webhooks/github/connect-repo`, {
    owner,
    repo,
  });

  return res.data;
}
