"use client";
import { Beer } from "@/app/types/beer";
import { Category } from "@/app/types/category";
import ImageDisplay from "@/components/ImageDisplay/ImageDisplay";
import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import DefaultBeerImage from "../../../../assets/img/beer.png";
import Image from "next/image";

export const columns: ColumnDef<Beer>[] = [
  {
    accessorKey: "image",
    header: "IMAGE",
    cell: ({ row }) => {
      return (
        <div className="relative size-10">
          <Avatar>
            <ImageDisplay item={row.original} className={""} />
          </Avatar>
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
          {(row.original as Beer).category.map((category: Category, index) => (
            <span
              key={index}
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
