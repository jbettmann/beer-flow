"use client";
import { searchParamsCache, searchParams } from "@/lib/searchparams";
import { useQueryState } from "nuqs";
import { useCallback, useState } from "react";

export function useStaffTableFilters() {
  const [searchQuery, setSearchQuery] = useQueryState(
    "q",
    searchParams.q
      .withOptions({ shallow: false, throttleMs: 1000 })
      .withDefault("")
  );
  const [roleFilter, setRoleFilter] = useQueryState(
    "role",
    searchParams.styles.withOptions({ shallow: false }).withDefault("")
  );
  const [page, setPage] = useQueryState(
    "page",
    searchParams.page.withDefault(1)
  );

  const isAnyFilterActive = roleFilter.length > 0 || !!searchQuery;

  const resetFilters = useCallback(() => {
    setSearchQuery("");
    setRoleFilter(null);
    setPage(1);
  }, [setSearchQuery, setRoleFilter, setPage]);

  return {
    page,
    setPage,
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    isAnyFilterActive,
    resetFilters,
  };
}
