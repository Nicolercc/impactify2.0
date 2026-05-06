import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function EventCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("overflow-hidden border-plum-100/50 bg-parchment", className)}>
      <Skeleton className="aspect-[4/3] w-full animate-pulse bg-parchment-100" />
      <CardContent className="p-5">
        <Skeleton className="h-7 w-3/4 animate-pulse bg-parchment-100" />
        <Skeleton className="mt-3 h-4 w-1/2 animate-pulse bg-parchment-100" />
        <Skeleton className="mt-6 h-4 w-24 animate-pulse bg-parchment-100" />
      </CardContent>
    </Card>
  );
}
