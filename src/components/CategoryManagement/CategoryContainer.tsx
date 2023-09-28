"use client";
import { useBreweryContext } from "@/context/brewery-beer";
import { LayoutGrid, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import CategoryDashboard from "./CategoryDashboard";
import CategoryList from "./CategoryList";
import StaffManagementTable from "../LoadingSkeleton/StaffManagementTableLS";
import { Brewery } from "@/app/types/brewery";

type Props = {};

const CategoryContainer = (props: Props) => {
  const { selectedBrewery } = useBreweryContext();
  const [createNewCategory, setCreateNewCategory] = useState<boolean>(false);
  const [viewFilter, setViewFilter] = useState<string>("All");

  return (
    selectedBrewery?.staff && (
      <>
        {/* Large Screen New Category Button */}
        <div className="flex justify-between md:p-5 ">
          <div className="flex flex-col w-fit mx-auto lg:m-0 lg:my-auto ">
            <h3 className="text-center lg:text-left">Category Management</h3>
            {/* <div className="text-sm badge badge-ghost opacity-50 mt-2">
              Owner {selectedBrewery.owner.fullName || ""}
            </div> */}
          </div>
          <div className="hidden lg:block">
            <button
              onClick={() => setCreateNewCategory(true)}
              className="create-btn"
            >
              + Category
            </button>
          </div>
        </div>

        {/* Small Screen New Category Button */}
        <div className="fixed right-5 bottom-20 p-1 z-[2] lg:hidden ">
          <button
            onClick={() => setCreateNewCategory(true)}
            className="btn btn-circle btn-white create-btn !btn-lg"
          >
            <Plus size={28} />
          </button>
        </div>
        <div className="flex flex-col w-full  md:p-5">
          <CategoryDashboard
            setViewFilter={setViewFilter}
            viewFilter={viewFilter}
          />
          <CategoryList
            viewFilter={viewFilter}
            createNewCategory={createNewCategory}
            setCreateNewCategory={setCreateNewCategory}
          />
        </div>
      </>
    )
  );
};

export default CategoryContainer;
