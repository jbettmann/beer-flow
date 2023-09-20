"use client";
import { useBreweryContext } from "@/context/brewery-beer";
import { LayoutGrid } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import CategoryDashboard from "./CategoryDashboard";
import CategoryList from "./CategoryList";

type Props = {};

const CategoryContainer = (props: Props) => {
  const { selectedBrewery } = useBreweryContext();
  const [createNewCategory, setCreateNewCategory] = useState<boolean>(false);
  const [viewFilter, setViewFilter] = useState<string>("All Categories");

  return (
    selectedBrewery?.staff && (
      <>
        {/* Large Screen New Category Button */}
        <div className="hidden lg:flex justify-between py-5 md:p-5 ">
          <div className="flex flex-col w-fit">
            <h3 className="text-left">Categories</h3>
            {/* <div className="text-sm badge badge-ghost opacity-50 mt-2">
              Owner {selectedBrewery.owner.fullName || ""}
            </div> */}
          </div>
          <button
            onClick={() => setCreateNewCategory(true)}
            className="btn btn-accent"
          >
            + Category
          </button>
        </div>

        {/* Small Screen New Category Button */}
        <div className="fixed right-5 bottom-20 p-1 z-[2] lg:hidden ">
          <button
            onClick={() => setCreateNewCategory(true)}
            className="btn btn-circle btn-lg btn-white"
          >
            <LayoutGrid size={28} color="#2b2b2b" />
          </button>
          <p className="hidden m-0 text-lg lg:flex">Beer</p>
        </div>
        <div className="flex flex-col w-full lg:flex-row py-2 md:p-5">
          <CategoryDashboard
            setViewFilter={setViewFilter}
            viewFilter={viewFilter}
          />
          <CategoryList
            viewFilter={viewFilter}
            brewery={selectedBrewery}
            createNewCategory={createNewCategory}
            setCreateNewCategory={setCreateNewCategory}
          />
        </div>
      </>
    )
  );
};

export default CategoryContainer;
