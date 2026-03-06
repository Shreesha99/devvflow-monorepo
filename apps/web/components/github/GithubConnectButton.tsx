"use client";

import { Github, ArrowRight } from "lucide-react";

export default function GithubConnectButton() {
  const connect = () => {
    window.location.href = "http://localhost:3000/auth/github";
  };

  return (
    <div className="max-w-xl mx-auto bg-white border border-gray-200 rounded-xl p-8 shadow-sm hover:shadow-md transition">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-gray-100 rounded-lg">
          <Github size={22} />
        </div>

        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-900">
            Connect GitHub
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Link your GitHub account to automatically sync commits, pull
            requests, and development activity with your tasks.
          </p>

          <button
            onClick={connect}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-sm rounded-md hover:bg-gray-800 transition"
          >
            Connect GitHub
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
