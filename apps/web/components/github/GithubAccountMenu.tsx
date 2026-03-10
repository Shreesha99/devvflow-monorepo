"use client";

import { useEffect, useState, useRef } from "react";
import { Github, LogOut, RefreshCw } from "lucide-react";

type GithubUser = {
  login: string;
  avatar_url: string;
};

export default function GithubAccountMenu({
  onLogout,
}: {
  onLogout: () => void;
}) {
  const [user, setUser] = useState<GithubUser | null>(null);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("github_token");
      if (!token) return;

      const res = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setUser(data);
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!user) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 hover:bg-muted rounded-md px-2 py-1 transition"
      >
        <img src={user.avatar_url} className="w-7 h-7 rounded-full" />

        <span className="text-sm text-foreground">{user.login}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-xl overflow-hidden z-9999">
          <div className="p-3 border-b border-border">
            <div className="text-sm font-medium text-foreground">
              {user.login}
            </div>

            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Github size={12} />
              GitHub connected
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full text-left px-3 py-2 hover:bg-muted text-sm flex items-center gap-2"
          >
            <RefreshCw size={14} />
            Switch account
          </button>

          <button
            onClick={onLogout}
            className="w-full text-left px-3 py-2 hover:bg-muted text-sm flex items-center gap-2 text-red-600"
          >
            <LogOut size={14} />
            Disconnect GitHub
          </button>
        </div>
      )}
    </div>
  );
}
