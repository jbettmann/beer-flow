import BeerTableContainer from "@/components/beers/beer-table-actions/beer-table-container";
import PageContainer from "@/components/layout/page-container";
import { buttonVariants } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import getIsAdminServer from "@/hooks/is-admin-server-hook";
import { searchParamsCache, serialize } from "@/lib/searchparams";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import Link from "next/link";
import { SearchParams } from "nuqs/server";

export const metadata = {
  title: "Dashboard: Brewery Beers",
};

async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ breweryId: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const resSearchParams = await searchParams;
  const { breweryId } = await params;

  const isAdmin = await getIsAdminServer(breweryId);

  // Allow nested RSCs to access the search params (in a type-safe way)
  searchParamsCache.parse(resSearchParams);

  // This key is used for invoke suspense if any of the search params changed (used for filters).
  const key = serialize({ ...resSearchParams });
  return (
    <PageContainer scrollable={false}>
      <div className="flex flex-1 flex-col space-y-4 ">
        <div className="flex items-start justify-between">
          <Heading
            title={`Beer List`}
            description="Manage products (Server side table functionalities.)"
          />
          {isAdmin && (
            <Link
              href={`/dashboard/breweries/${breweryId}/beers/create`}
              className={cn(buttonVariants(), "text-xs md:text-sm")}
            >
              <Plus className="h-4 w-4" /> Add New
            </Link>
          )}
        </div>
        <Separator />
        <BeerTableContainer />
      </div>
    </PageContainer>
  );
}
export default Page;
