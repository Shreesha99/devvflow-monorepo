"use client";

export default function DashboardAnalyticsSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* KPI METRICS */}

      <div className="grid grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white border rounded-xl p-6 space-y-3">
            <div className="h-3 w-24 bg-gray-200 rounded"></div>
            <div className="h-8 w-16 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>

      {/* CHARTS */}

      <div className="grid grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-white border rounded-xl p-6">
            <div className="h-4 w-32 bg-gray-200 rounded mb-6"></div>

            <div className="h-[240px] w-full bg-gray-100 rounded-lg"></div>
          </div>
        ))}
      </div>

      {/* LOWER SECTION */}

      <div className="grid grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-white border rounded-xl p-6 space-y-4">
            <div className="h-4 w-32 bg-gray-200 rounded"></div>

            {Array.from({ length: 5 }).map((__, j) => (
              <div key={j} className="h-3 w-full bg-gray-100 rounded"></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
