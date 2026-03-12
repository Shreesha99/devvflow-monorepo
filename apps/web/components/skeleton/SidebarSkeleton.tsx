"use client";

export default function SidebarSkeleton({
  collapsed = false,
}: {
  collapsed?: boolean;
}) {
  return (
    <div
      className={`bg-card border-r border-border flex flex-col animate-pulse
      ${collapsed ? "w-16" : "w-64"} h-[calc(100vh-64px)]`}
    >
      {/* toggle button placeholder */}

      <div className="p-3 flex justify-end">
        <div className="h-4 w-4 rounded bg-muted"></div>
      </div>

      {/* nav items */}

      <div className="flex flex-col gap-2 px-3 mt-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-md">
            <div className="h-4 w-4 rounded bg-muted"></div>

            {!collapsed && <div className="h-3 w-24 rounded bg-muted"></div>}
          </div>
        ))}
      </div>
    </div>
  );
}
