"use client";

import TableViewToggleButton from "@/components/Buttons/table-view-toggle-btn";
import BeerCardSkeleton from "@/components/skeletons/beer-card-skeleton";
import { DataTableFilterBox } from "@/components/ui/table/data-table-filter-box";
import { DataTableResetFilter } from "@/components/ui/table/data-table-reset-filter";
import { DataTableSearch } from "@/components/ui/table/data-table-search";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { useBreweryContext } from "@/context/brewery-beer";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";

import { ReusableTableWrapper } from "@/components/tables/reusable-table-wrapper";
import { useProductTableFilters } from "../beers/beer-table-actions/use-beer-table-filters";
import { BeerListTable } from "../beers/beer-list-table";
import { columns } from "../beers/beer-table-actions/columns";
import { Users } from "@/types/users";
import { useStaffTableFilters } from "./use-staff-table-filter";

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "staff", label: "Staff" },
];

export default function StaffTable() {
  const { selectedBrewery, isAdmin } = useBreweryContext();
  const searchParams = useSearchParams();

  const {
    setPage,
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    isAnyFilterActive,
    resetFilters,
  } = useStaffTableFilters();
  const roleParams = searchParams.get("role");

  const selectedRole = roleParams ? roleParams.split(".") : [];

  const searchIndex = useMemo(() => {
    return (
      selectedBrewery?.staff
        ?.filter((s): s is Users => typeof s !== "string")
        .map((staff) => ({
          id: staff._id,
          searchString: [staff.fullName, staff.email].join(" ").toLowerCase(),
        })) || []
    );
  }, [selectedBrewery]);

  const filteredStaff = useMemo(() => {
    if (!selectedBrewery) return [];

    const searchTerms = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);
    const staffList = selectedBrewery.staff.filter(
      (s): s is Users => typeof s !== "string"
    );

    return staffList
      .map((staff) => {
        const isAdmin = selectedBrewery.admin.some(
          (admin) => typeof admin !== "string" && admin._id === staff._id
        );
        return {
          ...staff,
          isAdmin,
        };
      })
      .filter((staff) => {
        // Role filter
        const roleMatch =
          selectedRole.length === 0 ||
          (staff.isAdmin && selectedRole.includes("admin")) ||
          (!staff.isAdmin && selectedRole.includes("staff"));

        // Search match
        const index = searchIndex.find((idx) => idx.id === staff._id);
        const searchMatch =
          searchTerms.length === 0 ||
          searchTerms.every((term) => index?.searchString.includes(term));

        return roleMatch && searchMatch;
      });
  }, [selectedBrewery, selectedRole, searchQuery, searchIndex]);

  return (
    <ReusableTableWrapper
      isTableView={true}
      setIsTableView={() => {}}
      showToggleView={false}
      header={
        <>
          <DataTableSearch
            searchKey="staff"
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            setPage={setPage}
          />
          <DataTableFilterBox
            filterKey="role"
            title="Role"
            options={ROLE_OPTIONS}
            setFilterValue={setRoleFilter}
            filterValue={roleFilter}
          />
          <DataTableResetFilter
            isFilterActive={isAnyFilterActive}
            onReset={resetFilters}
          />
        </>
      }
      tableComponent={
        <BeerListTable
          columns={columns}
          data={filteredStaff}
          totalItems={filteredStaff.length}
        />
      }
      cardComponent={null}
    />
  );
}
