import PageSkeleton from "@/components/loaders/PageSkeleton";

export default function Loading() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <PageSkeleton />
    </div>
  );
}
