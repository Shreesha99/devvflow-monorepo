"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { getRepos, connectRepo } from "@/lib/github";
import { Search, Lock, FolderGit2, SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("name");
  const [searching, setSearching] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const observer = useRef<IntersectionObserver | null>(null);

  const loadRepos = async (pageNumber: number) => {
    try {
      const data = await getRepos(pageNumber, 30);

      // If first page and no repos exist
      if (pageNumber === 1 && data.length === 0) {
        setHasMore(false);
        setRepos([]);
        return;
      }

      setRepos((prev) => {
        const existing = new Set(prev.map((r) => r.id));

        const newRepos = data.filter((repo: Repo) => !existing.has(repo.id));

        return [...prev, ...newRepos];
      });

      // stop infinite scroll when fewer than limit returned
      if (data.length < 30) {
        setHasMore(false);
      }
    } catch {
      toast.error("Failed to load repositories");
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadRepos(1);
      setPage(1);
      setLoading(false);
    };

    init();
  }, []);

  const lastRepoRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!hasMore || loadingMore) return;

      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(
        async (entries) => {
          if (!entries[0].isIntersecting || loading || loadingMore || !hasMore)
            return;

          setLoadingMore(true);

          const nextPage = page + 1;
          const start = Date.now();

          await loadRepos(nextPage);

          setPage(nextPage);
          const elapsed = Date.now() - start;
          if (elapsed < 400) {
            await new Promise((r) => setTimeout(r, 400 - elapsed));
          }

          setLoadingMore(false);
        },
        {
          root: scrollContainerRef.current,
          threshold: 1,
        }
      );

      if (node) observer.current.observe(node);
    },
    [loadingMore, hasMore, page]
  );

  const selectRepo = async (repo: Repo) => {
    if (connecting) return;

    setConnecting(true);

    const [owner, name] = repo.fullName.split("/");

    try {
      const project = await connectRepo(owner, name);

      localStorage.setItem("connected_repo", repo.fullName);
      localStorage.setItem("connected_project", project.id);

      toast.success(`Connected ${repo.fullName}`);

      onConnected(project.id, repo.fullName);
    } catch {
      toast.error(
        "Unable to connect repository. You may not have access to this repo."
      );
      setConnecting(false);
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

  if (loading) return <RepoSelectorSkeleton />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="relative bg-card/90 backdrop-blur-sm border border-border rounded-xl shadow-sm w-160 mx-auto flex flex-col h-130"
    >
      <AnimatePresence>
        {connecting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-card/80 backdrop-blur-sm flex items-center justify-center rounded-xl"
          >
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <motion.div
                className="w-4 h-4 border-2 border-muted border-t-primary rounded-full"
                animate={{ rotate: 360 }}
                transition={{
                  repeat: Infinity,
                  duration: 0.9,
                  ease: "linear",
                }}
              />

              <span>Connecting repository...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* HEADER */}

      <div className="p-6 border-b border-border">
        <h2 className="font-semibold text-lg text-foreground">
          Select Repository
        </h2>
        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
          <FolderGit2 size={13} />

          <span className="font-medium text-foreground">{repos.length}</span>

          <span>repositories loaded</span>

          {(loading || loadingMore) && (
            <motion.div
              className="ml-2 flex items-center gap-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                className="w-3 h-3 border-2 border-muted border-t-primary rounded-full"
                animate={{ rotate: 360 }}
                transition={{
                  repeat: Infinity,
                  duration: 0.9,
                  ease: "linear",
                }}
              />
            </motion.div>
          )}
        </div>

        <p className="text-sm text-muted-foreground mt-1">
          Choose a repository to connect with DevvDeck
        </p>

        <div className="mt-4 flex gap-2">
          <div className="relative flex-1 group">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground transition group-focus-within:text-primary"
            />

            <input
              value={query}
              onChange={(e) => {
                setSearching(true);
                setQuery(e.target.value);

                setTimeout(() => setSearching(false), 200);
              }}
              placeholder="Search repositories..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-border bg-background rounded-md outline-none transition focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-md hover:bg-muted transition">
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

      {/* REPO LIST */}

      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 relative"
      >
        <AnimatePresence>
          {(searching || loading) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 p-4 space-y-2"
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="relative overflow-hidden p-3 border border-border rounded-md flex items-center gap-2"
                >
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{
                      duration: 1.2,
                      ease: "linear",
                      repeat: Infinity,
                    }}
                    className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent"
                  />

                  <div className="w-4 h-4 bg-muted rounded z-10" />
                  <div className="h-3 bg-muted rounded w-[60%] z-10" />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div
          className={`space-y-2 transition-opacity duration-200 ${
            searching ? "opacity-0" : "opacity-100"
          }`}
        >
          {filteredRepos.map((repo, index) => {
            const isLast = index === filteredRepos.length - 1;

            return (
              <motion.div
                ref={isLast ? lastRepoRef : null}
                key={repo.fullName}
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                onClick={() => selectRepo(repo)}
                className="group p-3 border border-border rounded-md hover:bg-muted cursor-pointer flex items-center justify-between transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <motion.div
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {repo.private ? (
                      <Lock size={14} className="text-muted-foreground" />
                    ) : (
                      <FolderGit2 size={14} className="text-muted-foreground" />
                    )}
                  </motion.div>

                  <div className="flex flex-col min-w-0">
                    <span className="truncate font-medium text-foreground">
                      {repo.name}
                    </span>

                    <span className="text-xs text-muted-foreground truncate">
                      {repo.owner.login}
                    </span>
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0, x: -4 }}
                  whileHover={{ opacity: 1, x: 0 }}
                  className="text-xs text-muted-foreground"
                >
                  Connect →
                </motion.div>
              </motion.div>
            );
          })}

          {loadingMore && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center py-6"
            >
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <motion.div
                  className="w-4 h-4 border-2 border-muted border-t-primary rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.9,
                    ease: "linear",
                  }}
                />

                <motion.span
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                >
                  Loading more repositories
                </motion.span>
              </div>
            </motion.div>
          )}

          {!hasMore && (
            <div className="py-4 text-center text-xs text-muted-foreground">
              All repositories loaded
            </div>
          )}

          {filteredRepos.length === 0 && (
            <div className="text-sm text-muted-foreground text-center py-6">
              No repositories found
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
