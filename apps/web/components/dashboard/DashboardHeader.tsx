"use client";

import Image from "next/image";
import RepoDropdown from "@/components/github/RepoDropdown";
import GithubAccountMenu from "../github/GithubAccountMenu";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { motion } from "framer-motion";

export default function DashboardHeader({
  repo,
  githubConnected,
  onRepoChange,
  onLogoutGithub,
}: {
  repo?: string;
  githubConnected: boolean;
  onRepoChange: (projectId: string, repoFullName: string) => void;
  onLogoutGithub: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md px-6 py-2.5 flex items-center justify-between"
    >
      <div className="flex items-center gap-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 2 }}
            transition={{ type: "spring", stiffness: 260, damping: 15 }}
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-muted"
          >
            <Image
              src="/Logo.svg"
              alt="DevvDeck"
              width={24}
              height={24}
              priority
            />
          </motion.div>

          <span className="font-semibold text-sm tracking-tight text-foreground">
            DevvDeck
          </span>
        </div>

        {repo && (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Repository</span>
              <RepoDropdown currentRepo={repo} onRepoChange={onRepoChange} />
            </div>
          </motion.div>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.15 }}
        className="flex items-center gap-4"
      >
        <motion.div whileHover={{ scale: 1.08 }}>
          <ThemeToggle />
        </motion.div>

        {githubConnected && (
          <div>
            <GithubAccountMenu onLogout={onLogoutGithub} />
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
