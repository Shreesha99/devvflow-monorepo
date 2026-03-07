"use client";

import {
  LayoutDashboard,
  Kanban,
  Activity,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type View = "dashboard" | "kanban" | "activity" | "settings";

export default function Sidebar({
  collapsed,
  toggle,
  active,
  onNavigate,
}: {
  collapsed: boolean;
  toggle: () => void;
  active: View;
  onNavigate: (view: View) => void;
}) {
  return (
    <div
      className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col
      ${collapsed ? "w-16" : "w-64"} h-[calc(100vh-64px)]`}
    >
      <div className="p-3 flex justify-end">
        <button onClick={toggle} className="text-gray-500 hover:text-black">
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex flex-col gap-1 px-2">
        <SidebarItem
          icon={<LayoutDashboard size={18} />}
          label="Dashboard"
          collapsed={collapsed}
          active={active === "dashboard"}
          onClick={() => onNavigate("dashboard")}
        />
        <SidebarItem
          icon={<Kanban size={18} />}
          label="Tasks"
          collapsed={collapsed}
          active={active === "kanban"}
          onClick={() => onNavigate("kanban")}
        />

        <SidebarItem
          icon={<Activity size={18} />}
          label="Activity"
          collapsed={collapsed}
          active={active === "activity"}
          onClick={() => onNavigate("activity")}
        />

        <SidebarItem
          icon={<Settings size={18} />}
          label="Settings"
          collapsed={collapsed}
          active={active === "settings"}
          onClick={() => onNavigate("settings")}
        />
      </nav>
    </div>
  );
}

function SidebarItem({
  icon,
  label,
  collapsed,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition w-full text-left
      ${active ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100"}`}
    >
      {icon}
      {!collapsed && <span>{label}</span>}
    </button>
  );
}
