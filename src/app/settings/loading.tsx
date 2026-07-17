import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]" aria-label="Loading settings">
    <aside className="space-y-4"><Skeleton className="h-16 w-full" /><Skeleton className="h-11 w-full" /><Skeleton className="h-11 w-full" /><Skeleton className="h-11 w-full" /></aside>
    <main className="space-y-4"><Skeleton className="h-28 w-full rounded-xl" /><Skeleton className="h-52 w-full rounded-xl" /></main>
  </div>;
}
