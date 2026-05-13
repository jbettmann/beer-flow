import { Beer } from "@/types/beer";
import { Brewery } from "@/types/brewery";

type BreweryMember =
  | string
  | number
  | {
      _id?: string;
      fullName?: string;
      username?: string;
      email?: string;
      image?: string;
    };

export type OverviewMetric = {
  label: string;
  value: string;
  description: string;
};

export type OverviewBarDatum = {
  category: string;
  beers: number;
};

export type OverviewAreaDatum = {
  month: string;
  beers: number;
};

export type OverviewPieDatum = {
  role: string;
  members: number;
  fill: string;
};

export type OverviewRecentBeer = {
  id: string;
  name: string;
  style: string;
  abv: number;
  createdAt: string;
  archived: boolean;
  avatar: string;
  initials: string;
};

const MONTH_WINDOW = 6;

function getMemberId(member: BreweryMember | null | undefined) {
  if (!member) return null;
  if (typeof member === "string" || typeof member === "number") {
    return String(member);
  }
  return member._id ?? member.email ?? member.username ?? member.fullName ?? null;
}

function getMemberInitials(label: string) {
  const parts = label
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "");

  return parts.join("") || "BF";
}

function formatMonthKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

function formatMonthLabel(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "2-digit",
  });
}

function toDate(value: Beer["createdAt"]) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toBeerLabel(beer: Beer) {
  return beer.name || beer.style || "Beer";
}

export function buildOverviewMetrics(
  brewery: Brewery | null,
  beers: Beer[] | null
): OverviewMetric[] {
  const beerList = beers ?? [];
  const activeBeers = beerList.filter((beer) => !beer.archived);
  const archivedBeers = beerList.filter((beer) => beer.archived);
  const categoriesConfigured = brewery?.categories?.length ?? 0;
  const averageAbv =
    beerList.length > 0
      ? beerList.reduce((acc, beer) => acc + (beer.abv || 0), 0) /
        beerList.length
      : 0;

  return [
    {
      label: "Beer catalog",
      value: beerList.length.toLocaleString(),
      description: `${activeBeers.length} active, ${archivedBeers.length} archived`,
    },
    {
      label: "Active beers",
      value: activeBeers.length.toLocaleString(),
      description: "Currently shown in the brewery catalog",
    },
    {
      label: "Categories",
      value: categoriesConfigured.toLocaleString(),
      description: "Configured brewery categories",
    },
    {
      label: "Average ABV",
      value: `${averageAbv.toFixed(1)}%`,
      description: "Across the selected brewery's beer catalog",
    },
  ];
}

export function buildCategoryBarData(
  brewery: Brewery | null,
  beers: Beer[] | null
): OverviewBarDatum[] {
  const beerList = beers ?? [];
  const categoryCounts = new Map<string, number>();

  brewery?.categories?.forEach((category) => {
    categoryCounts.set(category.name, 0);
  });

  let uncategorized = 0;

  for (const beer of beerList) {
    const assigned = beer.category ?? [];
    if (!assigned.length) {
      uncategorized += 1;
      continue;
    }

    for (const category of assigned) {
      const current = categoryCounts.get(category.name) ?? 0;
      categoryCounts.set(category.name, current + 1);
    }
  }

  const categoryData = Array.from(categoryCounts.entries())
    .filter(([, beersCount]) => beersCount > 0)
    .map(([category, beersCount]) => ({
      category,
      beers: beersCount,
    }))
    .sort((left, right) => right.beers - left.beers);

  if (uncategorized > 0) {
    categoryData.push({
      category: "Uncategorized",
      beers: uncategorized,
    });
  }

  return categoryData.slice(0, 8);
}

export function buildMonthlyBeerData(beers: Beer[] | null): OverviewAreaDatum[] {
  const beerList = beers ?? [];
  const months = Array.from({ length: MONTH_WINDOW }, (_, index) => {
    const date = new Date();
    date.setDate(1);
    date.setHours(0, 0, 0, 0);
    date.setMonth(date.getMonth() - (MONTH_WINDOW - 1 - index));

    return {
      key: formatMonthKey(date),
      month: formatMonthLabel(date),
      beers: 0,
    };
  });

  const monthLookup = new Map(months.map((month) => [month.key, month]));

  for (const beer of beerList) {
    const date = toDate(beer.createdAt);
    if (!date) continue;

    const key = formatMonthKey(date);
    const month = monthLookup.get(key);
    if (month) {
      month.beers += 1;
    }
  }

  return months.map(({ month, beers }) => ({ month, beers }));
}

export function buildTeamPieData(brewery: Brewery | null): OverviewPieDatum[] {
  const seen = new Set<string>();
  const take = (role: string, members: BreweryMember[] | undefined, fill: string) => {
    const count =
      members?.reduce((acc, member) => {
        const memberId = getMemberId(member);
        if (!memberId || seen.has(memberId)) {
          return acc;
        }

        seen.add(memberId);
        return acc + 1;
      }, 0) ?? 0;

    return count > 0 ? { role, members: count, fill } : null;
  };

  const output = [
    take("Owner", brewery?.owner ? [brewery.owner as BreweryMember] : [], "var(--chart-1)"),
    take("Admin", brewery?.admin as BreweryMember[] | undefined, "var(--chart-2)"),
    take("Staff", brewery?.staff as BreweryMember[] | undefined, "var(--chart-3)"),
  ].filter(Boolean) as OverviewPieDatum[];

  return output;
}

export function buildRecentBeerData(
  beers: Beer[] | null
): OverviewRecentBeer[] {
  return (beers ?? [])
    .slice()
    .sort((left, right) => {
      const leftDate = toDate(left.createdAt)?.getTime() ?? 0;
      const rightDate = toDate(right.createdAt)?.getTime() ?? 0;
      return rightDate - leftDate;
    })
    .slice(0, 5)
    .map((beer) => {
      const label = toBeerLabel(beer);
      return {
        id: beer._id,
        name: label,
        style: beer.style || "Unstyled beer",
        abv: beer.abv || 0,
        createdAt: toDate(beer.createdAt)?.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }) ?? "Unknown date",
        archived: beer.archived,
        avatar: beer.image || "",
        initials: getMemberInitials(label),
      };
    });
}

export function getOverviewContextState(
  brewery: Brewery | null,
  beers: Beer[] | null
) {
  return {
    hasBrewery: Boolean(brewery),
    hasBeers: Boolean(beers),
    metrics: buildOverviewMetrics(brewery, beers),
    categoryBars: buildCategoryBarData(brewery, beers),
    monthlyBeers: buildMonthlyBeerData(beers),
    teamPie: buildTeamPieData(brewery),
    recentBeers: buildRecentBeerData(beers),
  };
}
