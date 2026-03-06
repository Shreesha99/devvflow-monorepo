import axios from "axios";

const API = "http://localhost:3000";

export async function getRepos() {
  const token = localStorage.getItem("github_token");

  const res = await axios.get(`${API}/webhooks/github/repos`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
}

export async function connectRepo(owner: string, repo: string) {
  const token = localStorage.getItem("github_token");

  const res = await axios.patch(
    `${API}/webhooks/github/connect-repo`,
    {
      owner,
      repo,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
}
