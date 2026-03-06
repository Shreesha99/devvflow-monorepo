import axios from "axios";

const API = "http://localhost:3000";

export async function createTask(data: {
  title: string;
  description?: string;
  projectId: string;
}) {
  const res = await axios.post(`${API}/tasks`, data);
  return res.data;
}
