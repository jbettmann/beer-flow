import { Skeleton } from "@/components/ui/skeleton";
export default function Loading() { return <div className="space-y-4" aria-label="Loading brewery settings"><Skeleton className="h-24 w-full rounded-xl" />{[0,1,2].map((item) => <Skeleton key={item} className="h-20 w-full rounded-lg" />)}</div>; }
