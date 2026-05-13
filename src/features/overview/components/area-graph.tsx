"use client";

import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { BarChart3 } from "lucide-react";

import { useBreweryContext } from "@/context/brewery-beer";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { buildMonthlyBeerData } from "../lib/overview-data";

const chartConfig = {
  beers: {
    label: "Beers added",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

function EmptyStateCard({ title, description }: { title: string; description: string }) {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex min-h-[220px] items-center justify-center">
        <div className="text-muted-foreground flex flex-col items-center gap-2 text-sm">
          <BarChart3 className="size-5" />
          <span>No timeline data yet</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function AreaGraph() {
  const { selectedBrewery, selectedBeers, breweryLoading, beersLoading } =
    useBreweryContext();

  const chartData = useMemo(() => buildMonthlyBeerData(selectedBeers), [selectedBeers]);

  if (breweryLoading || beersLoading) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!selectedBrewery) {
    return (
      <EmptyStateCard
        title="Beer additions over time"
        description="Select a brewery to see monthly beer creation volume."
      />
    );
  }

  if (!selectedBeers?.length) {
    return (
      <EmptyStateCard
        title="Beer additions over time"
        description="This brewery has not added any beers yet."
      />
    );
  }

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Beer additions over time</CardTitle>
        <CardDescription>New beers added across the last six months</CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <defs>
              <linearGradient id="fillBeers" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-beers)"
                  stopOpacity={0.9}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-beers)"
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Area
              dataKey="beers"
              type="natural"
              fill="url(#fillBeers)"
              stroke="var(--color-beers)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="text-muted-foreground text-sm">
          Counts are based on beer record creation dates.
        </div>
      </CardFooter>
    </Card>
  );
}
