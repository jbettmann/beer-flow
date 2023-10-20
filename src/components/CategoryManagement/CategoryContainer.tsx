"use client";
import { useBreweryContext } from "@/context/brewery-beer";
import { Plus } from "lucide-react";
import { useState } from "react";
import CategoryDashboard from "./CategoryDashboard";
import CategoryList from "./CategoryList";
import { Users } from "@/app/types/users";

type Props = {};

const CategoryContainer = (props: Props) => {
  const { selectedBrewery } = useBreweryContext();
  const [createNewCategory, setCreateNewCategory] = useState<boolean>(false);
  const [viewFilter, setViewFilter] = useState<string>("All");

  return (
    selectedBrewery?.categories && (
      <>
        {/* Large Screen New Category Button */}
        <div className="flex justify-between md:p-5 md:pr-0 ">
          <div className="flex flex-col w-fit mx-auto lg:m-0 lg:my-auto ">
            <h3 className="text-center lg:text-left">Category Management</h3>
            <div className="text-sm badge badge-ghost opacity-50 mt-2">
              Owner {(selectedBrewery.owner as Users).fullName || ""}
            </div>
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
        <div className="fixed right-5 bottom-10 p-1 z-[2] lg:hidden ">
          <button
            onClick={() => setCreateNewCategory(true)}
            className="btn btn-circle btn-white create-btn !btn-lg"
          >
            <Plus size={28} />
          </button>
        </div>
        <div className="flex flex-col w-full sm:w-2/3 lg:w-full  md:p-5 mx-auto">
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
