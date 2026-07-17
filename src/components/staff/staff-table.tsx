"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DataTable } from "@/components/ui/table/data-table";
import { DataTableFilterBox } from "@/components/ui/table/data-table-filter-box";
import { DataTableResetFilter } from "@/components/ui/table/data-table-reset-filter";
import { DataTableSearch } from "@/components/ui/table/data-table-search";
import { useBreweryContext } from "@/context/brewery-beer";
import { getBreweryMemberId, getBreweryMemberIds } from "@/lib/brewery-members";
import { getInitials } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { ReusableTableWrapper } from "@/components/tables/reusable-table-wrapper";
import { Users } from "@/types/users";
import { useStaffTableFilters } from "./use-staff-table-filter";
import { Badge } from "../ui/badge";

const ROLE_OPTIONS = [
  { value: "owner", label: "Owner" },
  { value: "admin", label: "Admin" },
  { value: "staff", label: "Staff" },
];

type StaffRole = "owner" | "admin" | "staff";

type StaffRow = {
  _id: string;
  fullName: string;
  email: string;
  image: string;
  roleKey: StaffRole;
  role: "Owner" | "Admin" | "Staff";
  isOwner: boolean;
  isAdmin: boolean;
};

export default function StaffTable() {
  const { selectedBrewery } = useBreweryContext();
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

  const selectedRole = useMemo(
    () => (roleParams ? roleParams.split(".") : []),
    [roleParams],
  );

  const ownerId = useMemo(() => {
    return getBreweryMemberId(selectedBrewery?.owner);
  }, [selectedBrewery?.owner]);

  const roster = useMemo(() => {
    if (!selectedBrewery) {
      return [];
    }

    const members = new Map<string, Users>();

    const addPopulatedMembers = (group: Array<string | number | Users>) => {
      for (const member of group) {
        if (member && typeof member === "object") {
          const memberId = getBreweryMemberId(member);

          if (memberId) {
            members.set(memberId, {
              ...member,
              _id: memberId,
            });
          }
        }
      }
    };

    addPopulatedMembers(
      selectedBrewery.staff as Array<string | number | Users>,
    );
    addPopulatedMembers(
      selectedBrewery.admin as Array<string | number | Users>,
    );

    if (selectedBrewery.owner && typeof selectedBrewery.owner === "object") {
      const populatedOwnerId = getBreweryMemberId(selectedBrewery.owner);

      if (populatedOwnerId) {
        members.set(populatedOwnerId, {
          ...selectedBrewery.owner,
          _id: populatedOwnerId,
        });
      }
    }

    const adminIds = new Set(
      getBreweryMemberIds(
        selectedBrewery.admin as Array<string | number | Users>,
      ),
    );
    const rows: StaffRow[] = Array.from(members.values()).map((member) => {
      const isOwner = ownerId === member._id;
      const isAdmin = isOwner || adminIds.has(member._id);

      return {
        ...member,
        isOwner,
        isAdmin,
        roleKey: isOwner ? "owner" : isAdmin ? "admin" : "staff",
        role: isOwner ? "Owner" : isAdmin ? "Admin" : "Staff",
      } satisfies StaffRow;
    });

    if (ownerId && !rows.some((member) => member._id === ownerId)) {
      rows.unshift({
        _id: ownerId,
        fullName: "Brewery owner",
        email: "",
        image: "",
        isOwner: true,
        isAdmin: true,
        roleKey: "owner",
        role: "Owner",
      });
    }

    return rows;
  }, [ownerId, selectedBrewery]);

  const searchIndex = useMemo(
    () =>
      roster.map((staff) => ({
        id: staff._id,
        searchString: [staff.fullName, staff.email, staff.role]
          .join(" ")
          .toLowerCase(),
      })),
    [roster],
  );

  const filteredStaff = useMemo(() => {
    const searchTerms = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);

    return roster.filter((staff) => {
      const roleMatch =
        selectedRole.length === 0 || selectedRole.includes(staff.roleKey);

      const index = searchIndex.find((idx) => idx.id === staff._id);
      const searchMatch =
        searchTerms.length === 0 ||
        searchTerms.every((term) => index?.searchString.includes(term));

      return roleMatch && searchMatch;
    });
  }, [roster, selectedRole, searchQuery, searchIndex]);

  const handleRoleFilterChange = async (
    value: string | ((old: string) => string | null) | null,
  ) => {
    await Promise.all([setRoleFilter(value), setPage(1)]);
    return new URLSearchParams();
  };

  const columns = useMemo<ColumnDef<StaffRow>[]>(
    () => [
      {
        accessorKey: "fullName",
        header: "NAME",
        cell: ({ row }) => {
          const staff = row.original;

          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={staff.image || ""} alt={staff.fullName} />
                <AvatarFallback>{getInitials(staff.fullName)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="font-medium">{staff.fullName}</div>
                {staff.email ? (
                  <div className="truncate text-sm text-muted-foreground md:hidden">
                    {staff.email}
                  </div>
                ) : null}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "email",
        header: "EMAIL",
        cell: ({ row }) => row.original.email || " ",
      },
      {
        accessorKey: "role",
        header: "ROLE",
        cell: ({ row }) => (
          <Badge variant={row.original.isOwner ? "default" : "secondary"}>
            {row.original.role}
          </Badge>
        ),
      },
    ],
    [],
  );

  return (
    <ReusableTableWrapper
      isTableView={true}
      setIsTableView={() => {}}
      showToggleView={false}
      fillHeight
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
            setFilterValue={handleRoleFilterChange}
            filterValue={roleFilter}
          />
          <DataTableResetFilter
            isFilterActive={isAnyFilterActive}
            onReset={resetFilters}
          />
        </>
      }
      tableComponent={
        <DataTable
          columns={columns}
          data={filteredStaff}
          totalItems={filteredStaff.length}
          paginationMode="client"
          hiddenColumnIdsBelowMd={["email"]}
          emptyState={
            <div className="flex min-h-32 flex-col items-center justify-center gap-3 py-6">
              <span>
                {isAnyFilterActive
                  ? "No staff match these filters."
                  : "No staff members found."}
              </span>
              {isAnyFilterActive ? (
                <button
                  className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                  onClick={resetFilters}
                >
                  Reset filters
                </button>
              ) : null}
            </div>
          }
        />
      }
      cardComponent={null}
    />
  );
}
