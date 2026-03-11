import { GitCommit, GitPullRequest, GitMerge } from "lucide-react";
import { Activity } from "@/app/dashboard/page";

export default function ActivityItem({ activity }: { activity: Activity }) {
  if (activity.type === "commit_pushed") {
    const message = activity.payload?.message || "";
    const author = activity.payload?.author;

    const isMergeCommit =
      message.startsWith("Merge pull request") ||
      message.startsWith("Merged PR") ||
      message.includes("pull request");

    if (isMergeCommit) {
      return (
        <div className="flex items-center gap-2 text-muted-foreground">
          <GitMerge size={14} className="text-purple-500" />
          merge commit by <b className="text-foreground">{author}</b>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <GitCommit size={14} className="text-muted-foreground" />
        commit by <b className="text-foreground">{author}</b>
      </div>
    );
  }

  if (activity.type === "pull_request_opened") {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <GitPullRequest size={14} className="text-blue-500" />
        PR opened
      </div>
    );
  }

  if (activity.type === "pull_request_merged") {
    const message = activity.payload?.message || "";
    const author = activity.payload?.author;

    if (message.startsWith("Merge pull request")) {
      return (
        <div className="flex items-center gap-2 text-muted-foreground">
          <GitCommit size={14} className="text-muted-foreground" />
          merge commit by <b className="text-foreground">{author}</b>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <GitMerge size={14} className="text-green-500" />
        PR merged
      </div>
    );
  }

  return null;
}
