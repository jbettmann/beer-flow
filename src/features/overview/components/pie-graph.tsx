"use client";

import { useMemo } from "react";
import { Label, Pie, PieChart } from "recharts";
import { Users } from "lucide-react";

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
import { buildTeamPieData } from "../lib/overview-data";

const chartConfig = {
  members: {
    label: "Members",
  },
  Owner: {
    label: "Owner",
    color: "var(--chart-1)",
  },
  Admin: {
    label: "Admins",
    color: "var(--chart-2)",
  },
  Staff: {
    label: "Staff",
    color: "var(--chart-3)",
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
          <Users className="size-5" />
          <span>No team data to show</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function PieGraph() {
  const { selectedBrewery, breweryLoading, beersLoading } = useBreweryContext();

  const chartData = useMemo(() => buildTeamPieData(selectedBrewery), [selectedBrewery]);
  const totalMembers = chartData.reduce((acc, curr) => acc + curr.members, 0);

  if (breweryLoading || beersLoading) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <Skeleton className="mx-auto h-[250px] w-[250px] rounded-full" />
        </CardContent>
      </Card>
    );
  }

  if (!selectedBrewery) {
    return (
      <EmptyStateCard
        title="Team access mix"
        description="Select a brewery to see how ownership, admin, and staff access is distributed."
      />
    );
  }

  if (!chartData.length) {
    return (
      <EmptyStateCard
        title="Team access mix"
        description="No team members are attached to this brewery yet."
      />
    );
  }

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Team access mix</CardTitle>
        <CardDescription>
          Owner, admin, and staff membership for the selected brewery
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-[250px]"
        >
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={chartData}
              dataKey="members"
              nameKey="role"
              innerRadius={60}
              strokeWidth={2}
              stroke="var(--background)"
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalMembers.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground text-sm"
                        >
                          Members
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="text-muted-foreground text-sm">
        Role counts are deduplicated across owner, admin, and staff lists.
      </CardFooter>
    </Card>
  );
}
