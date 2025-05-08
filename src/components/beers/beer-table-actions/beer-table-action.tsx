"use client";

import TableViewToggleButton from "@/components/Buttons/table-view-toggle-btn";
import { DataTableFilterBox } from "@/components/ui/table/data-table-filter-box";
import { DataTableResetFilter } from "@/components/ui/table/data-table-reset-filter";
import { DataTableSearch } from "@/components/ui/table/data-table-search";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { useBreweryContext } from "@/context/brewery-beer";
import { useIsMobile } from "@/hooks/use-mobile";
import { Category } from "@/types/category";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { useProductTableFilters } from "./use-beer-table-filters";

import BeerCardSkeleton from "@/components/skeletons/beer-card-skeleton";
import BeerListCarousel from "../beer-list-carousel";
import { BeerListTable } from "../beer-list-table";
import { columns } from "./columns";

export default function ProductTableAction() {
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
      selectedBrewery?.categories.map((category) => ({
        value: category.name,
        label: category.name,
      })) || [],
    [selectedBrewery?.categories]
  );

  const STYLE_OPTIONS = useMemo(() => {
    const styleMap = new Map<string, { value: string; label: string }>();
    selectedBeers?.forEach((beer) => {
      if (beer.style && !styleMap.has(beer.style)) {
        styleMap.set(beer.style, { value: beer.style, label: beer.style });
      }
    });
    return Array.from(styleMap.values());
  }, [selectedBeers, selectedBrewery]);

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
    [selectedBeers, selectedBrewery]
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
    selectedBrewery,
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
          <div className="flex flex-wrap gap-4">
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
          </div>
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
      <Suspense
        fallback={
          isTableView ? (
            <DataTableSkeleton columnCount={5} rowCount={10} />
          ) : (
            <BeerCardSkeleton />
          )
        }
      >
        {isTableView ? (
          <BeerListTable
            columns={columns}
            data={filteredBeers}
            totalItems={filteredBeers.length}
          />
        ) : (
          <BeerListCarousel data={filteredBeers} />
        )}
      </Suspense>
    </>
  );
}
