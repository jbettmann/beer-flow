"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { BarChart3 } from "lucide-react";

import { useBreweryContext } from "@/context/brewery-beer";
import {
  Card,
  CardContent,
  CardDescription,
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
import { buildCategoryBarData } from "../lib/overview-data";

const chartConfig = {
  beers: {
    label: "Beers",
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
          <span>Nothing to chart yet</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function BarGraph() {
  const { selectedBrewery, selectedBeers, breweryLoading, beersLoading } =
    useBreweryContext();

  const chartData = useMemo(
    () => buildCategoryBarData(selectedBrewery, selectedBeers),
    [selectedBrewery, selectedBeers]
  );

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
        title="Beers by category"
        description="Select a brewery to see how its beers are distributed across categories."
      />
    );
  }

  if (!chartData.length) {
    return (
      <EmptyStateCard
        title="Beers by category"
        description="This brewery has no categorized beers yet."
      />
    );
  }

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Beers by category</CardTitle>
        <CardDescription>
          Counted from the selected brewery&apos;s current beer catalog
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="category"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={24}
            />
            <ChartTooltip
              cursor={{ fill: "var(--primary)", opacity: 0.1 }}
              content={
                <ChartTooltipContent
                  className="w-[180px]"
                  nameKey="beers"
                  labelFormatter={(value) => value}
                />
              }
            />
            <Bar dataKey="beers" fill="var(--primary)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
