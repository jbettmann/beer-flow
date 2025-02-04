"use client";
import React from "react";
import { Button } from "../ui/button";
import { GalleryVerticalEnd, TableIcon } from "lucide-react";

type TableViewToggleButtonProps = {
  tableView: boolean;
  setTableView: (view: boolean) => void;
};

const TableViewToggleButton = ({
  tableView,
  setTableView,
}: TableViewToggleButtonProps) => {
  return (
    <>
      <div className="flex flex-1 justify-end">
        <Button
          type="button"
          variant={!tableView ? "default" : "outline"}
          onClick={() => setTableView(false)}
          className="rounded-r-none"
        >
          <GalleryVerticalEnd className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={tableView ? "default" : "outline"}
          onClick={() => setTableView(true)}
          className="rounded-l-none"
        >
          <TableIcon className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
};

export default TableViewToggleButton;
