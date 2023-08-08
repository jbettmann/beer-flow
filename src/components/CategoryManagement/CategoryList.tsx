"use client";
import { Category } from "@/app/types/category";
import { useBreweryContext } from "@/context/brewery-beer";
import { Check, Library, Scissors } from "lucide-react";
import { useEffect, useState } from "react";
import CategoryItem from "./CategoryItem";

type Props = {};

const CategoryList = (props: Props) => {
  const { selectedBeers, selectedBrewery } = useBreweryContext();
  const [categories, setCategories] = useState<Category[]>(
    selectedBrewery?.categories || []
  );
  const [checkedBeers, setCheckedBeers] = useState<
    Record<string, Record<string, boolean>>
  >({});

  const [isOpen, setIsOpen] = useState<boolean[]>(categories.map(() => false));
  const [showRemoveAll, setShowRemoveAll] = useState(false);

  const handleOpen = (index: number) => {
    const newIsOpen = [...isOpen];
    newIsOpen[index] = !newIsOpen[index];
    setIsOpen(newIsOpen);
  };

  const handleCheckbox = (
    categoryId: string,
    beerId: string,
    isChecked: boolean
  ) => {
    setCheckedBeers((prevCheckedBeers) => ({
      ...prevCheckedBeers,
      [categoryId]: {
        ...(prevCheckedBeers[categoryId] || {}),
        [beerId]: isChecked,
      },
    }));
  };

  const getButtonsState = () => {
    let isMoveAllButtonVisible = false;
    let isRemoveAllButtonVisible = true;
    let checkedCount = 0;

    for (const categoryId in checkedBeers) {
      for (const beerId in checkedBeers[categoryId]) {
        if (checkedBeers[categoryId][beerId]) {
          const beer = selectedBeers?.find((b) => b._id === beerId);
          isMoveAllButtonVisible = true; // At least one beer is checked
          checkedCount++;

          // If a beer is found and it has only one category, then the Remove All button should not be visible
          if (!(beer?.category && beer.category.length > 1)) {
            isRemoveAllButtonVisible = false;
            break; // Exit the loop early since one non-removable beer is enough
          }
        }
      }
      if (!isRemoveAllButtonVisible) break; // Exit the outer loop as well
    }

    // If no beers are checked, the Remove All button should not be visible
    if (checkedCount === 0) {
      isRemoveAllButtonVisible = false;
    }

    return { isMoveAllButtonVisible, isRemoveAllButtonVisible };
  };

  const { isMoveAllButtonVisible, isRemoveAllButtonVisible } =
    getButtonsState();

  console.log({ checkedBeers });
  useEffect(() => {
    setCategories(selectedBrewery?.categories || []);
  }, [selectedBrewery]);

  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra ">
        {/* head */}
        <thead>
          <tr>
            <th>
              <label>
                <input type="checkbox" className="checkbox" />
              </label>
            </th>
            <th>Name</th>
            <th>Beers Under Category</th>

            <th></th>
          </tr>
        </thead>
        <tbody>
          {/* row 1 */}

          {categories &&
            categories.map((category, index) => {
              // Filter the beers that belong to this category
              const beersInCategory = selectedBeers?.filter((beer) => {
                return beer.category
                  ? beer.category.some((cat) => cat.name === category.name)
                  : false;
              });
              return (
                <>
                  <tr
                    key={index}
                    className="hover:bg-accent hover:bg-opacity-30 hover:cursor-pointer"
                    onClick={() => handleOpen(index)}
                  >
                    <th></th>
                    <td>
                      <div className="flex items-center space-x-3 ">
                        <label className=" swap btn btn-circle">
                          <input type="checkbox" className="hover:checked" />

                          {/* this hidden checkbox controls the state */}
                          <Library size={24} className="swap-off " />

                          <Check size={24} className=" swap-on" />
                        </label>
                        <div>
                          <div className="font-bold ">
                            {category.name}{" "}
                            <span className="text-sm opacity-50">
                              ({beersInCategory?.length || 0})
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <button
                        className="btn btn-ghost btn-xs"
                        // onClick={() => handleOpen(index)}
                      >
                        {" "}
                        {beersInCategory?.length || 0}
                      </button>
                    </td>

                    <th>details</th>
                  </tr>
                  <tr>
                    <td colSpan={5}>
                      <div
                        className={`collapse transition-all duration-300 overflow-hidden ${
                          isOpen[index] ? "max-h-[500px]" : "max-h-0"
                        } `}
                      >
                        <input
                          type="checkbox"
                          checked={isOpen[index]}
                          className="hidden"
                        />

                        <div className="collapse-content table table-zebra">
                          <thead>
                            <tr>
                              <th>
                                <label></label>
                              </th>
                              <th>Beer</th>
                              <th>Category</th>
                              <th className="flex justify-end">
                                {isMoveAllButtonVisible ? (
                                  <button
                                    className="btn btn-warning"
                                    onClick={() => handleCommonAction("Move")}
                                  >
                                    Move All
                                  </button>
                                ) : (
                                  <div className="btn bg-transparent px-4 py-3 w-32"></div>
                                )}
                                {isRemoveAllButtonVisible && (
                                  <button
                                    className="btn btn-error ml-2"
                                    onClick={() => handleCommonAction("Remove")}
                                  >
                                    Remove All
                                  </button>
                                )}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {beersInCategory && beersInCategory.length > 0 ? (
                              beersInCategory?.map((beer) => (
                                <CategoryItem
                                  key={beer._id}
                                  beer={beer}
                                  category={category}
                                  handleCheckbox={(beerId, isChecked) =>
                                    handleCheckbox(
                                      category._id,
                                      beerId,
                                      isChecked
                                    )
                                  }
                                  isChecked={
                                    checkedBeers[category._id]?.[beer._id] ||
                                    false
                                  }
                                />
                              ))
                            ) : (
                              <tr>
                                <td colSpan={5}>
                                  <div className="flex items-center justify-center w-full h-20 text-gray-500">
                                    <p className="text-xl font-bold text-center">
                                      No beers in this category
                                    </p>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </div>
                      </div>
                    </td>
                  </tr>
                </>
              );
            })}
        </tbody>
        {/* foot */}
        <tfoot>
          <tr>
            <th></th>
            <th>Name</th>
            <th>Beers Under Category</th>

            <th></th>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default CategoryList;
