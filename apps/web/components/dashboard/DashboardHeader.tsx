import { LayoutDashboard, Github } from "lucide-react";

export default function DashboardHeader() {
  return (
    <div className="border-b bg-white px-10 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2 font-semibold text-lg">
        <LayoutDashboard size={20} />
        DevFlow
      </div>

      <div className="flex items-center gap-3 text-sm text-gray-500">
        <Github size={16} />
        GitHub Sync Active
      </div>
    </div>
  );
}
