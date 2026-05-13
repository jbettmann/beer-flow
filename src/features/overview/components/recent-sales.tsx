"use client";

import { useMemo } from "react";
import { Beer } from "lucide-react";

import { useBreweryContext } from "@/context/brewery-beer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { buildRecentBeerData } from "../lib/overview-data";

function EmptyStateCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Newest beers</CardTitle>
        <CardDescription>
          Added beers will appear here once the selected brewery has data.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex min-h-[220px] items-center justify-center">
        <div className="text-muted-foreground flex flex-col items-center gap-2 text-sm">
          <Beer className="size-5" />
          <span>No recent beers yet</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function RecentSales() {
  const { selectedBrewery, selectedBeers, breweryLoading, beersLoading } =
    useBreweryContext();

  const recentBeers = useMemo(
    () => buildRecentBeerData(selectedBeers),
    [selectedBeers]
  );

  if (breweryLoading || beersLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="ml-4 space-y-1">
                  <Skeleton className="h-4 w-[120px]" />
                  <Skeleton className="h-4 w-[160px]" />
                </div>
                <Skeleton className="ml-auto h-4 w-[80px]" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!selectedBrewery) {
    return <EmptyStateCard />;
  }

  if (!recentBeers.length) {
    return <EmptyStateCard />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Newest beers</CardTitle>
        <CardDescription>
          Latest additions for {selectedBrewery.companyName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {recentBeers.map((beer) => (
            <div key={beer.id} className="flex items-center">
              <Avatar className="h-9 w-9">
                {beer.avatar ? (
                  <AvatarImage src={beer.avatar} alt={beer.name} />
                ) : null}
                <AvatarFallback>{beer.initials}</AvatarFallback>
              </Avatar>
              <div className="ml-4 min-w-0 space-y-1">
                <p className="truncate text-sm font-medium leading-none">
                  {beer.name}
                </p>
                <p className="text-muted-foreground text-sm">
                  {beer.style} {beer.createdAt ? `• ${beer.createdAt}` : ""}
                </p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                {beer.archived ? <Badge variant="outline">Archived</Badge> : null}
                <span className="font-medium tabular-nums">
                  {typeof beer.abv === "number"
                    ? `${beer.abv.toFixed(1)}% ABV`
                    : "ABV n/a"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
