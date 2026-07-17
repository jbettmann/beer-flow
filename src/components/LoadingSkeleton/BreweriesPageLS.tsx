import { Skeleton } from "@/components/ui/skeleton";

export default function BreweriesPageLS() {
  return <section className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-8 sm:py-10" aria-label="Loading breweries">
    <div className="flex items-end justify-between gap-4"><div className="space-y-2"><Skeleton className="h-9 w-40" /><Skeleton className="h-4 w-72 max-w-full" /></div><Skeleton className="hidden h-10 w-32 sm:block" /></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{[0,1,2].map((item) => <div key={item} className="flex h-32 items-center gap-4 rounded-xl border p-5"><Skeleton className="size-14 rounded-full" /><div className="flex-1 space-y-2"><Skeleton className="h-5 w-2/3" /><Skeleton className="h-4 w-1/3" /></div></div>)}</div>
  </section>;
}
