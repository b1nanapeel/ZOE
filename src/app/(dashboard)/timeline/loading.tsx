import { ClipCardSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function TimelineLoading() {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-full" />
        ))}
      </div>
      <div className="space-y-2">
        <ClipCardSkeleton />
        <ClipCardSkeleton />
        <ClipCardSkeleton />
        <ClipCardSkeleton />
      </div>
    </div>
  );
}
