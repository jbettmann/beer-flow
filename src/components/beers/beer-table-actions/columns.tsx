"use client";
import { Beer } from "@/types/beer";
import { Category } from "@/types/category";
import ImageDisplay from "@/components/ImageDisplay/ImageDisplay";
import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import DefaultBeerImage from "../../../../assets/img/beer.png";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

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
    accessorKey: "style",
    header: "STYLE",
  },
  {
    accessorKey: "category",
    header: "CATEGORY",
    cell: ({ row }) => {
      return (
        <div className="relative flex flex-wrap gap-1 ">
          {(row.original as Beer).category.map((category: Category, index) => (
            <Badge key={index} className=" mr-1" variant={"secondary"}>
              {category.name}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "description",
    header: "DESCRIPTION",
    cell: ({ row }) => {
      return (
        <div className="text-wrap line-clamp-2 min-w-80 max-w-[30rem]">
          {row.original.description}
        </div>
      );
    },
  },

  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
