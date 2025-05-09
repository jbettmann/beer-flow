import { Suspense, useState } from "react";
import BeerCardSkeleton from "../skeletons/beer-card-skeleton";
import { DataTableSkeleton } from "../ui/table/data-table-skeleton";
import TableViewToggleButton from "../Buttons/table-view-toggle-btn";
import { DataTableSearch } from "../ui/table/data-table-search";

type ViewType = "table" | "card";

interface ReusableTableWrapperProps<T> {
  header?: React.ReactNode;
  showToggleView?: boolean;
  isTableView: boolean;
  setIsTableView: (val: boolean) => void;
  tableComponent: React.ReactNode;
  cardComponent?: React.ReactNode;
  isLoading?: boolean;
}

export function ReusableTableWrapper<T>({
  header,
  showToggleView = false,
  isTableView,
  setIsTableView,
  tableComponent,
  cardComponent,
  isLoading,
}: ReusableTableWrapperProps<T>) {
  return (
    <>
      <div className="flex flex-nowrap gap-2 mb-4">
        <div className="flex flex-wrap items-center gap-4 w-full">{header}</div>
        {showToggleView && (
          <TableViewToggleButton
            tableView={isTableView}
            setTableView={setIsTableView}
          />
        )}
      </div>
      <Suspense
        fallback={
          isLoading ? (
            isTableView ? (
              <DataTableSkeleton columnCount={5} rowCount={10} />
            ) : (
              <BeerCardSkeleton />
            )
          ) : null
        }
      >
        {isTableView ? tableComponent : cardComponent}
      </Suspense>
    </>
  );
}
