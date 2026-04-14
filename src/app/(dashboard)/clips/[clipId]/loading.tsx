import { Skeleton } from "@/components/ui/skeleton";

export default function ClipDetailLoading() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="aspect-video w-full rounded-xl" />
      <Skeleton className="h-4 w-48" />
      <div className="space-y-3">
        <Skeleton className="h-3 w-24" />
        <div className="flex gap-2">
          <Skeleton className="h-7 w-24 rounded-full" />
          <Skeleton className="h-7 w-20 rounded-full" />
          <Skeleton className="h-7 w-28 rounded-full" />
        </div>
      </div>
    </div>
  );
}
