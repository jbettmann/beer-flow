import { Skeleton } from "@/components/ui/skeleton";
export default function Loading() { return <div className="space-y-4" aria-label="Loading brewery profile"><Skeleton className="h-10 w-40" /><Skeleton className="h-44 w-full rounded-xl" /><Skeleton className="h-36 w-full rounded-xl" /><Skeleton className="h-36 w-full rounded-xl" /></div>; }
