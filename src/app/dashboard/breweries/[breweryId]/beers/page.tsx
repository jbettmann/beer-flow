import PageContainer from "@/components/layout/page-container";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import Link from "next/link";
import { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import ProductTableAction from "@/features/products/components/product-tables/product-table-action";
import { searchParamsCache, serialize } from "@/lib/searchparams";
import { Heading } from "@/components/ui/heading";
import ProductListingPage from "@/features/products/components/product-listing";
import TableViewToggleButton from "@/components/Buttons/table-view-toggle-btn";
import { auth } from "@/auth";
import getSingleBrewery from "@/lib/getSingleBrewery";
import getIsAdminServer from "@/hooks/is-admin-server-hook";

export const metadata = {
  title: "Dashboard: Brewery Beers",
};

type pageProps = {
  searchParams: Promise<SearchParams>;
  params: { breweryId: string };
};

async function Page(props: pageProps) {
  const { breweryId } = props.params;
  const selectedBrewery = await getSingleBrewery([
    `https://beer-bible-api.vercel.app/breweries/${breweryId}`,
  ]);
  const isAdmin = await getIsAdminServer(breweryId);
  const searchParams = await props.searchParams;
  // Allow nested RSCs to access the search params (in a type-safe way)
  searchParamsCache.parse(searchParams);

  // This key is used for invoke suspense if any of the search params changed (used for filters).
  const key = serialize({ ...searchParams });

  return (
    <PageContainer scrollable={false}>
      <div className="flex flex-1 flex-col space-y-4">
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
              <Plus className="mr-2 h-4 w-4" /> Add New
            </Link>
          )}
        </div>
        <Separator />
        <ProductTableAction categories={selectedBrewery.categories} />
      </div>
    </PageContainer>
  );
}
export default Page;
