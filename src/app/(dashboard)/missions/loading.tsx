import { CardSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function MissionsLoading() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-3 w-16" />
      <div className="space-y-2">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-3 w-64" />
      </div>
      <CardSkeleton lines={2} />
      <CardSkeleton lines={2} />
    </div>
  );
}
