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
  fillHeight?: boolean;
}

export function ReusableTableWrapper<T>({
  header,
  showToggleView = false,
  isTableView,
  setIsTableView,
  tableComponent,
  cardComponent,
  isLoading,
  fillHeight = false,
}: ReusableTableWrapperProps<T>) {
  return (
    <div className={fillHeight ? "flex min-h-0 flex-1 flex-col" : undefined}>
      <div className="mb-4 flex flex-nowrap gap-2">
        <div className="flex w-full flex-wrap items-center gap-2 sm:gap-4">
          {header}
        </div>
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
    </div>
  );
}
