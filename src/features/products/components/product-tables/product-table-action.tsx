"use client";

import { DataTableFilterBox } from "@/components/ui/table/data-table-filter-box";
import { DataTableResetFilter } from "@/components/ui/table/data-table-reset-filter";
import { DataTableSearch } from "@/components/ui/table/data-table-search";
import { useProductTableFilters } from "./use-product-table-filters";
import { useBreweryContext } from "@/context/brewery-beer";
import { useMemo } from "react";

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
  const { selectedBeers, selectedBrewery } = useBreweryContext();
  const CATEGORY_OPTIONS = useMemo(
    () =>
      selectedBrewery?.categories.map((category) => ({
        value: category.name,
        label: category.name,
      })) || [],
    [selectedBrewery, selectedBrewery?.categories]
  );

  const STYLE_OPTIONS = useMemo(() => {
    const styles = new Set<string>();
    selectedBeers?.forEach((beer) => {
      if (beer.style) styles.add(beer.style);
    });
    return (
      Array.from(styles).map((style) => ({
        value: style,
        label: style,
      })) || []
    );
  }, [selectedBrewery?.beers]);

  return (
    <div className="flex flex-wrap items-center gap-4">
      <DataTableSearch
        searchKey="name"
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
  );
}
