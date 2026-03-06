"use client";

import { Github } from "lucide-react";

export default function GithubConnectButton() {
  const connect = () => {
    window.location.href = "http://localhost:3000/auth/github";
  };

  return (
    <button
      onClick={connect}
      className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
    >
      <Github size={16} />
      Connect GitHub
    </button>
  );
}
