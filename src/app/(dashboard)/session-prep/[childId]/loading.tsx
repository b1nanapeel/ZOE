import { CardSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function SessionPrepLoading() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-3 w-16" />
      <div className="space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-3 w-48" />
      </div>
      <CardSkeleton lines={2} />
      <CardSkeleton lines={3} />
    </div>
  );
}
