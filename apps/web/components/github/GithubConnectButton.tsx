"use client";

import { Github, Loader2, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useState } from "react";

const BRAND = "#1D63D8";

export default function GithubConnectButton() {
  const [loading, setLoading] = useState(false);

  const connect = () => {
    setLoading(true);

    const t = toast.loading("Redirecting to GitHub...");

    setTimeout(() => {
      toast.dismiss(t);
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/github`;
    }, 500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="max-w-xl mx-auto"
    >
      <div className="bg-card border border-border rounded-xl p-7 shadow-sm">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div
            className="flex items-center justify-center w-10 h-10 rounded-md border border-border"
            style={{
              background: "rgba(29, 99, 216, 0.08)",
              color: BRAND,
            }}
          >
            <Github size={18} />
          </div>

          <div className="flex-1">
            <h3 className="text-sm font-semibold text-foreground">GitHub</h3>

            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              Connect your GitHub account to sync commits, pull requests, and
              developer activity with your tasks automatically.
            </p>

            <div className="mt-5 flex items-center justify-between">
              <motion.button
                onClick={connect}
                disabled={loading}
                whileTap={{ scale: 0.96 }}
                className="group relative flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-md transition disabled:opacity-80 cursor-pointer overflow-hidden"
                style={{ background: BRAND }}
              >
                {/* shine animation */}
                {loading && (
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{
                      duration: 1.2,
                      ease: "linear",
                      repeat: Infinity,
                    }}
                    className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent"
                  />
                )}

                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    Connect
                    {/* Arrow */}
                    <motion.span
                      className="flex items-center"
                      initial={false}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 20,
                      }}
                    >
                      <ArrowUpRight size={14} />
                    </motion.span>
                  </>
                )}
              </motion.button>

              <span className="text-xs text-muted-foreground">
                Secure OAuth via GitHub
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
