import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex min-h-0 flex-1 overflow-hidden p-4 md:px-6">
      <div className="flex min-h-0 w-full flex-1 flex-col gap-4">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64 max-w-full" />
          <Skeleton className="h-5 w-80 max-w-full" />
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-14" />
            <Skeleton className="h-6 w-9 rounded-full" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-px w-full" />

        <div className="flex min-h-0 flex-1 flex-col gap-4">
          <div className="flex flex-wrap gap-2 sm:gap-4">
            <Skeleton className="h-10 min-w-0 flex-1 sm:max-w-sm" />
            <Skeleton className="h-10 w-24" />
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border">
            <div className="grid h-12 shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b px-4 md:grid-cols-[minmax(9rem,2fr)_minmax(10rem,2fr)_minmax(5rem,1fr)]">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="hidden h-4 w-16 md:block" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="min-h-0 flex-1 space-y-0 overflow-hidden">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="grid h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b px-4 md:grid-cols-[minmax(9rem,2fr)_minmax(10rem,2fr)_minmax(5rem,1fr)]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
                    <div className="min-w-0 space-y-1.5">
                      <Skeleton className="h-4 w-24 max-w-full" />
                      <Skeleton className="h-3 w-28 max-w-full md:hidden" />
                    </div>
                  </div>
                  <Skeleton className="hidden h-4 w-36 md:block" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              ))}
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-3 pb-1 sm:flex-row sm:items-center sm:justify-between">
            <Skeleton className="h-4 w-40" />
            <div className="flex items-center justify-between gap-4">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
