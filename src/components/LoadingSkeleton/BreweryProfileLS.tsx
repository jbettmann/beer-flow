import { Skeleton } from "@/components/ui/skeleton";

export default function BreweryProfileSkeleton() {
  return <section className="mx-auto w-full max-w-7xl space-y-8 px-4 py-6 sm:px-8 sm:py-10" aria-label="Loading beer catalog">
    <div className="space-y-2"><Skeleton className="h-9 w-48" /><Skeleton className="h-4 w-72 max-w-full" /></div>
    {[0,1].map((section) => <div key={section} className="space-y-4"><Skeleton className="h-7 w-36" /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[0,1,2].map((card) => <div key={card} className="overflow-hidden rounded-xl border"><Skeleton className="aspect-[4/3] w-full rounded-none" /><div className="space-y-3 p-5"><Skeleton className="h-6 w-2/3" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-4/5" /></div></div>)}</div></div>)}
  </section>;
}
