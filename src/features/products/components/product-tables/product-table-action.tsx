"use client";

import { DataTableFilterBox } from "@/components/ui/table/data-table-filter-box";
import { DataTableResetFilter } from "@/components/ui/table/data-table-reset-filter";
import { DataTableSearch } from "@/components/ui/table/data-table-search";
import { useProductTableFilters } from "./use-product-table-filters";
import { useBreweryContext } from "@/context/brewery-beer";
import { Suspense, useMemo, useState } from "react";
import TableViewToggleButton from "@/components/Buttons/table-view-toggle-btn";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import ProductListingPage from "../product-listing";
import BreweryProfiles from "@/components/BreweryProfiles";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Category } from "@/app/types/category";
import { useSearchParams } from "next/navigation";
import { DataTable as BeerListTable } from "@/components/ui/table/data-table";
import { columns } from "./columns";

export default function ProductTableAction({
  categories,
}: {
  categories: Category[];
}) {
  const {
    stylesFilter,
    setStylesFilter,
    categoriesFilter,
    setCategoriesFilter,
    isAnyFilterActive,
    resetFilters,
    searchQuery,
    setPage,
    setSearchQuery,
  } = useProductTableFilters();
  const isMobile = useIsMobile();
  const searchParams = useSearchParams();
  const { selectedBeers, selectedBrewery, isAdmin } = useBreweryContext();

  // Get params directly from URL using Next.js navigation hook
  const page = searchParams.get("page");
  const search = searchParams.get("q");
  const pageLimit = searchParams.get("limit");
  const categoriesParam = searchParams.get("categories");
  const stylesParam = searchParams.get("styles");

  const selectedCategories = categoriesParam ? categoriesParam.split(".") : [];
  const selectedStyles = stylesParam ? stylesParam.split(".") : [];

  const [isTableView, setIsTableView] = useState<boolean>(
    isAdmin ? true : false
  );
  const CATEGORY_OPTIONS = useMemo(
    () =>
      categories.map((category) => ({
        value: category.name,
        label: category.name,
      })) || [],
    [selectedBrewery, categories]
  );

  const STYLE_OPTIONS = useMemo(() => {
    const styleMap = new Map<string, { value: string; label: string }>();
    selectedBeers?.forEach((beer) => {
      if (beer.style && !styleMap.has(beer.style)) {
        styleMap.set(beer.style, { value: beer.style, label: beer.style });
      }
    });
    return Array.from(styleMap.values());
  }, [selectedBeers]);

  const searchIndex = useMemo(
    () =>
      selectedBeers?.map((beer) => ({
        id: beer._id,
        searchString: [
          beer.name,
          beer.style,
          beer.abv,
          beer.ibu,
          ...(beer.hops || []),
          ...(beer.malt || []),
        ]
          .join(" ")
          .toLowerCase(),
      })) || [],
    [selectedBeers]
  );

  // Combined filter function with optimized search
  const filteredBeers = useMemo(() => {
    if (!selectedBeers) return [];

    const searchTerms = searchQuery?.toLowerCase().split(/\s+/) || [];

    return selectedBeers.filter((beer) => {
      // Category filter
      const categoryMatch =
        selectedCategories.length === 0 ||
        beer.category?.some((cat) => selectedCategories.includes(cat.name));

      // Style filter
      const styleMatch =
        selectedStyles.length === 0 ||
        (beer.style && selectedStyles.includes(beer.style));

      // Search term filter
      const beerIndex = searchIndex.find((idx) => idx.id === beer._id);
      const searchMatch =
        searchTerms.length === 0 ||
        searchTerms.every((term) => beerIndex?.searchString.includes(term));

      return categoryMatch && styleMatch && searchMatch;
    });
  }, [
    selectedBeers,
    selectedCategories,
    selectedStyles,
    searchQuery,
    searchIndex,
  ]);

  return (
    <>
      <div className="flex flex-nowrap gap-2">
        <div className="flex flex-wrap items-center gap-4 w-full">
          <DataTableSearch
            searchKey="beers"
            searchQuery={searchQuery as string}
            setSearchQuery={setSearchQuery}
            setPage={setPage}
          />
          <DataTableFilterBox
            filterKey="categories"
            title="Categories"
            options={CATEGORY_OPTIONS}
            setFilterValue={setCategoriesFilter}
            filterValue={categoriesFilter as string}
          />
          <DataTableFilterBox
            filterKey="styles"
            title="Styles"
            options={STYLE_OPTIONS}
            setFilterValue={setStylesFilter}
            filterValue={stylesFilter}
          />
          <DataTableResetFilter
            isFilterActive={isAnyFilterActive}
            onReset={resetFilters}
          />
        </div>

        {isAdmin && (
          <TableViewToggleButton
            tableView={isTableView}
            setTableView={setIsTableView}
          />
        )}
      </div>
      <Suspense fallback={<DataTableSkeleton columnCount={5} rowCount={10} />}>
        {isTableView ? (
          <BeerListTable
            columns={columns}
            data={filteredBeers}
            totalItems={filteredBeers.length}
          />
        ) : (
          <BreweryProfiles categories={categories} data={filteredBeers} />
        )}
      </Suspense>
      {/* Small Screen New Beer Button */}
      {isAdmin && isMobile && (
        //  Small Screen New Beer Button
        <div className="fixed right-5 bottom-10 p-1 z-[2] lg:hidden ">
          <Link
            href={`/dashboard/breweries/${selectedBrewery?._id}/beers/create`}
            className={cn(
              buttonVariants({ size: "actionButton" }),
              "text-xs md:text-sm rounded-full px-2"
            )}
          >
            <Plus />
          </Link>
        </div>
      )}
    </>
  );
}
