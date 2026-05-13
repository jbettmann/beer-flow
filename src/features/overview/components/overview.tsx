"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";
import { Beer, Layers3, Percent } from "lucide-react";

import { useBreweryContext } from "@/context/brewery-beer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getOverviewContextState } from "../lib/overview-data";

function OverviewMetricCard({
  label,
  value,
  description,
  icon,
}: {
  label: string;
  value: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <Card className="@container/card">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div className="space-y-1">
          <CardDescription>{label}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {value}
          </CardTitle>
        </div>
        <div className="text-muted-foreground rounded-lg border border-border/60 bg-muted/30 p-2">
          {icon}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-muted-foreground text-sm">{description}</p>
      </CardContent>
    </Card>
  );
}

function OverviewMetricSkeleton() {
  return (
    <Card className="@container/card">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-20" />
        </div>
        <Skeleton className="h-10 w-10 rounded-lg" />
      </CardHeader>
      <CardContent className="pt-0">
        <Skeleton className="h-4 w-full" />
      </CardContent>
    </Card>
  );
}

export default function OverviewSummary() {
  const { selectedBrewery, selectedBeers, breweryLoading, beersLoading } =
    useBreweryContext();

  const overview = useMemo(
    () => getOverviewContextState(selectedBrewery, selectedBeers),
    [selectedBrewery, selectedBeers]
  );

  if (breweryLoading || beersLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <OverviewMetricSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (!overview.hasBrewery) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>Select a brewery</CardTitle>
          <CardDescription>
            Pick a brewery from the switcher to see live counts for beers,
            categories, and ABV.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const metrics = overview.metrics;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <OverviewMetricCard
        label={metrics[0].label}
        value={metrics[0].value}
        description={metrics[0].description}
        icon={<Beer className="size-4" />}
      />
      <OverviewMetricCard
        label={metrics[1].label}
        value={metrics[1].value}
        description={metrics[1].description}
        icon={<Beer className="size-4" />}
      />
      <OverviewMetricCard
        label={metrics[2].label}
        value={metrics[2].value}
        description={metrics[2].description}
        icon={<Layers3 className="size-4" />}
      />
      <OverviewMetricCard
        label={metrics[3].label}
        value={metrics[3].value}
        description={metrics[3].description}
        icon={<Percent className="size-4" />}
      />
    </div>
  );
}
