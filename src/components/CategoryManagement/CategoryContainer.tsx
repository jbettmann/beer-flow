"use client";
import { useBreweryContext } from "@/context/brewery-beer";
import { useState } from "react";
import CategoryDashboard from "./CategoryDashboard";
import CategoryList from "./CategoryList";

type Props = {};

const CategoryContainer = (props: Props) => {
  const { selectedBrewery } = useBreweryContext();
  const [createNewCategory, setCreateNewCategory] = useState<boolean>(false);
  const [viewFilter, setViewFilter] = useState<string>("All Categories");
  console.log({ createNewCategory });
  return (
    selectedBrewery?.staff && (
      <>
        <div className="flex justify-between p-5">
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
            + New Category
          </button>
        </div>
        <div className="flex flex-col w-full lg:flex-row p-5">
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
