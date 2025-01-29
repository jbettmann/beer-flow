"use client";
import { Product } from "@/constants/data";
import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { CellAction } from "./cell-action";
import ImageDisplay from "@/components/ImageDisplay/ImageDisplay";

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "image",
    header: "IMAGE",
    cell: ({ row }) => {
      return (
        <div className="relative ">
          <ImageDisplay item={row.original} className={"rounded-full"} />
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: "NAME",
  },
  {
    accessorKey: "category",
    header: "CATEGORY",
    cell: ({ row }) => {
      return (
        <div className="relative ">
          {row.original.category.map((category) => (
            <span
              key={category}
              className="text-xs bg-gray-200 rounded-full px-2 py-1 mr-1"
            >
              {category.name}
            </span>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "style",
    header: "STYLE",
  },
  {
    accessorKey: "description",
    header: "DESCRIPTION",
  },

  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
