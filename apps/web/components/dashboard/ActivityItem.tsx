import { GitCommit, GitPullRequest, GitMerge } from "lucide-react";
import { Activity } from "@/app/dashboard/page";

export default function ActivityItem({ activity }: { activity: Activity }) {
  if (activity.type === "commit_pushed") {
    return (
      <div className="flex items-center gap-2">
        <GitCommit size={14} className="text-gray-400" />
        commit by <b>{activity.payload.author}</b>
      </div>
    );
  }

  if (activity.type === "pull_request_opened") {
    return (
      <div className="flex items-center gap-2">
        <GitPullRequest size={14} className="text-blue-500" />
        PR opened
      </div>
    );
  }

  if (activity.type === "pull_request_merged") {
    return (
      <div className="flex items-center gap-2">
        <GitMerge size={14} className="text-green-500" />
        PR merged
      </div>
    );
  }

  return null;
}
