import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function EventDetailLoading() {
  return (
    <div className="min-h-screen bg-parchment pb-20">
      <Skeleton className="h-64 w-full animate-pulse bg-parchment-100 md:h-80" />
      <div className="mx-auto max-w-6xl px-4 pt-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="flex gap-2">
              <Skeleton className="h-7 w-24 rounded-full bg-parchment-100" />
              <Skeleton className="h-7 w-28 rounded-full bg-parchment-100" />
            </div>
            <Skeleton className="h-12 w-3/4 max-w-xl bg-parchment-100" />
            <div className="flex flex-wrap gap-4">
              <Skeleton className="h-4 w-48 bg-parchment-100" />
              <Skeleton className="h-4 w-40 bg-parchment-100" />
              <Skeleton className="h-4 w-32 bg-parchment-100" />
            </div>
            <Skeleton className="h-px w-full bg-parchment-100" />
            <Skeleton className="h-6 w-48 bg-parchment-100" />
            <Skeleton className="h-32 w-full bg-parchment-100" />
            <Skeleton className="h-40 w-full rounded-2xl bg-parchment-100" />
          </div>
          <aside>
            <Card className="border-plum-100 bg-card shadow-lg">
              <CardContent className="space-y-4 p-6">
                <Skeleton className="h-6 w-full bg-parchment-100" />
                <Skeleton className="h-4 w-2/3 bg-parchment-100" />
                <Skeleton className="h-2 w-full bg-parchment-100" />
                <Skeleton className="h-11 w-full bg-parchment-100" />
                <Skeleton className="h-11 w-full bg-parchment-100" />
                <Skeleton className="h-10 w-full bg-parchment-100" />
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
