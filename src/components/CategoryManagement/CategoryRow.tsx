"use client";
import { Category } from "@/app/types/category";
import { useBreweryContext } from "@/context/brewery-beer";
import updateBeerCategory from "@/lib/PUT/updateBeerCategory";
import { LayoutGrid, LogIn, PencilLine, Scissors, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import RemoveBeerFromCategory from "../Alerts/RemoveBeerFromCategory";
import CategoryItem from "./CategoryItem";

import { Beer } from "@/app/types/beer";
import handleMoveBeerToCategory from "@/lib/handleSubmit/handleMoveBeerToCategory";
import MoveBeerToCategory from "../Alerts/MoveBeerToCategory";
import { FormValues } from "../CreateBeerForm/types";

type Props = {
  category: Category;
  index: number;
  isOpen: boolean;
  handleOpen: (index: number) => void;
  selectAll: boolean;
  handleEmptyCategory: (categoryId: string, isEmpty: boolean) => void;
  handleCategoryCheckbox: (categoryId: string, isChecked: boolean) => void;
  beersInCategory: Beer[];
  handleDeleteAlert: () => void;
};

const CategoryRow = ({
  category,
  index,
  isOpen,
  handleOpen,
  selectAll,
  handleEmptyCategory,
  handleCategoryCheckbox,
  beersInCategory,
  handleDeleteAlert,
}: Props) => {
  const [toContinue, setToContinue] = useState(false);
  const [toMoveContinue, setToMoveContinue] = useState(false);

  const [alertOpen, setAlertOpen] = useState<boolean>(false);
  const [moveAlertOpen, setMoveAlertOpen] = useState<boolean>(false);

  const [moveCategory, setMoveCategory] = useState<FormValues | []>([]);

  const [checkedBeers, setCheckedBeers] = useState<
    Record<string, Record<string, boolean>>
  >({});
  const [checkedBeersCount, setCheckedBeersCount] = useState<
    Record<string, number>
  >({});

  const [categoryCheckBox, setCategoryCheckBox] = useState<boolean>(false);

  const { data: session } = useSession();

  const {
    selectedBeers,
    selectedBrewery,
    setSelectedBeers,
    setSelectedBrewery,
  } = useBreweryContext();

  const [isEmpty, setIsEmpty] = useState(
    !beersInCategory || beersInCategory.length === 0
  );

  const calculateIsEmpty = () =>
    !beersInCategory || beersInCategory.length === 0;

  useEffect(() => {
    setIsEmpty(calculateIsEmpty());
  }, [selectedBeers]);

  const handleCategoryCheck = () => {
    const newCheckedState = !categoryCheckBox;
    setCategoryCheckBox(newCheckedState);
    handleCategoryCheckbox(category._id, newCheckedState);
    console.log("handleCategoryCheck", categoryCheckBox);
  };

  const handleBeerCheckbox = (
    categoryId: string,
    beerId: string,
    isChecked: boolean
  ) => {
    setCheckedBeers((prevCheckedBeers) => {
      const updatedCategory = {
        ...(prevCheckedBeers[categoryId] || {}),
        [beerId]: isChecked,
      };

      // Calculate the checked beers count for the category
      const count = Object.values(updatedCategory).filter(Boolean).length;

      // Update the count state
      setCheckedBeersCount((prevCount) => ({
        ...prevCount,
        [categoryId]: count,
      }));

      return {
        ...prevCheckedBeers,
        [categoryId]: updatedCategory,
      };
    });
  };

  const getButtonsState = (categoryId: string) => {
    let isMoveAllButtonVisible = false;
    let isRemoveAllButtonVisible = true;
    let checkedCount = 0;

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

    // If no beers are checked, the Remove All button should not be visible
    if (checkedCount === 0) {
      isRemoveAllButtonVisible = false;
    }

    return { isMoveAllButtonVisible, isRemoveAllButtonVisible };
  };

  const beersToUpdate = () => {
    // Identify the beers that need to be moved
    const beerIdsToMove = Object.keys(checkedBeers[category._id] || {}).filter(
      (beerId) => checkedBeers[category._id][beerId]
    );

    if (beerIdsToMove.length === 0) return; // No beers to move

    return beerIdsToMove;
  };

  const removeBeersFromCategory = async (categoryId: string) => {
    try {
      // Determine which beers to update

      const beerIdsToUpdate = beersToUpdate() || [];

      // Prepare the updated categories for each beer by removing the specified category
      const updatedBeersRequests = beerIdsToUpdate
        .map((beerId) => {
          const beer = selectedBeers?.find((b) => b._id === beerId);
          if (!beer) return null;

          // Build an array of category IDs that don't include the one being removed
          const updatedCategoryIds = beer.category
            .filter((cat) => cat._id !== categoryId)
            .map((cat) => cat._id);

          return updateBeerCategory({
            beerId,
            updatedCategory: updatedCategoryIds,
            breweryId: selectedBrewery?._id,
            accessToken: session?.user.accessToken,
          });
        })
        .filter(Boolean);

      // Call the `updateBeerCategory` function for each updated beer
      await Promise.all(updatedBeersRequests);

      // Update the client state
      setSelectedBeers((prevSelectedBeers: Beer[]) => {
        // Iterate over the previous selected beers and create a new array
        return prevSelectedBeers?.map((beer) => {
          if (beerIdsToUpdate.includes(beer._id)) {
            // If this beer's ID is in the list of IDs to update, remove the category from its categories
            const updatedCategories = beer.category.filter(
              (cat) => cat._id !== categoryId
            );
            return { ...beer, category: updatedCategories }; // Return the updated beer object
          } else {
            return beer; // If it's not the beer we want to update, return it as is
          }
        });
      });

      // Optionally, you may want to reset the checked beers for this category
      setCheckedBeers((prevCheckedBeers) => ({
        ...prevCheckedBeers,
        [categoryId]: {},
      }));
    } catch (error) {
      console.error(
        "An error occurred while removing beers from category:",
        error
      );

      // Optionally, show an error message to the user
    } finally {
      setToContinue(false);
      setIsEmpty(!beersInCategory || beersInCategory.length === 0);
    }
  };

  const moveBeerToCategory = async (categoryId: string) => {
    try {
      // Determine which beers to update
      const beerIdsToMove = beersToUpdate() || [];

      const updatedBeersRequests = beerIdsToMove
        .map((beerId) => {
          const beer = selectedBeers?.find((b) => b._id === beerId);
          if (!beer) return null;

          // Remove the current category and add the target category
          const updatedCategoryIds = beer.category
            .filter((cat) => cat._id !== category._id) // Exclude current category
            .map((cat) => cat._id);

          return handleMoveBeerToCategory({
            values: moveCategory,
            beerId,
            updatedCategory: updatedCategoryIds,
            brewery: selectedBrewery,
            accessToken: session?.user.accessToken,
          });
        })
        .filter(Boolean);

      // Update the beers with the new category
      const updatedBeers = await Promise.all(updatedBeersRequests);

      // Extract all unique category IDs from the updated beers
      const updatedCategoryIds = new Set(
        updatedBeers.flatMap((beer) => beer.category.map((cat) => cat._id))
      );

      // Identify the new categories that are not in the selectedBrewery.categories
      const newCategories: Category[] = [];
      updatedCategoryIds.forEach((categoryId) => {
        if (
          !selectedBrewery?.categories.some((cat) => cat._id === categoryId)
        ) {
          const newCategory = updatedBeers
            .flatMap((beer) => beer?.category)
            .find((cat) => cat?._id === categoryId);
          if (newCategory) {
            newCategories.push(newCategory);
          }
        }
      });

      // NEED updatedBeers to return the updated beers with the new category
      // If there are new categories, update the selectedBrewery
      if (newCategories.length > 0) {
        setSelectedBrewery((prevBrewery) => ({
          ...prevBrewery,
          categories: [...(prevBrewery?.categories || []), ...newCategories],
        }));
      }
      // Update the client state with the newly updated beers
      setSelectedBeers((prevSelectedBeers) => {
        return prevSelectedBeers?.map((prevBeer) => {
          const updatedBeer = updatedBeers.find(
            (beer) => beer?._id === prevBeer._id
          );
          return updatedBeer || prevBeer; // Replace the beer if it was updated, or keep it as is
        });
      });

      // Optionally, you may want to reset the checked beers for this category
      setCheckedBeers((prevCheckedBeers) => ({
        ...prevCheckedBeers,
        [categoryId]: {},
      }));
    } catch (error) {
      console.error(
        "An error occurred while removing beers from category:",
        error
      );

      // Optionally, show an error message to the user
    } finally {
      setMoveAlertOpen(false);
      setIsEmpty(!beersInCategory || beersInCategory.length === 0);
    }
  };

  // Get the state for the buttons specific to this category
  const { isMoveAllButtonVisible, isRemoveAllButtonVisible } = getButtonsState(
    category._id
  );

  const getCategoriesNotInCheckedBeers = () => {
    // Get all the unique categories from selectedBrewery
    const allCategories = selectedBrewery?.categories || [];

    // Get all the unique categories from checkedBeers
    const checkedBeerCategories = Object.keys(checkedBeers)
      .flatMap((categoryId) => {
        return Object.keys(checkedBeers[categoryId]).flatMap((beerId) =>
          checkedBeers[categoryId][beerId]
            ? selectedBeers
                ?.find((beer) => beer._id === beerId)
                ?.category.map((cat) => cat._id) || []
            : []
        );
      })
      .filter((value, index, self) => self.indexOf(value) === index); // To get unique category IDs

    // Find the categories that are not in checkedBeerCategories
    const categoriesNotInCheckedBeers = allCategories.filter(
      (category) => !checkedBeerCategories.includes(category._id)
    );

    return categoriesNotInCheckedBeers;
  };

  const categoriesNotInCheckedBeers = getCategoriesNotInCheckedBeers();

  useEffect(() => {
    handleEmptyCategory(category._id, isEmpty);
  }, [isEmpty]);

  // Call Remove or Move Beer to Category
  useEffect(() => {
    if (toContinue) {
      removeBeersFromCategory(category._id);
    }
    if (toMoveContinue) {
      moveBeerToCategory(category._id);
    }
  }, [toContinue, toMoveContinue]);

  // Update the categoryCheckBox state when selectAll changes
  useEffect(() => {
    setCategoryCheckBox(selectAll);
    handleEmptyCategory(category._id, isEmpty);
    handleCategoryCheckbox(category._id, selectAll);
    console.log("selectAll changed", selectAll);
  }, [selectAll]);

  // Closes category if category checkbox is checked
  useEffect(() => {
    if (isOpen && categoryCheckBox) handleOpen(index);
  }, [categoryCheckBox]);

  return (
    <>
      {alertOpen && (
        <RemoveBeerFromCategory
          alertOpen={alertOpen}
          category={category}
          setToContinue={setToContinue}
          setAlertOpen={setAlertOpen}
        />
      )}
      {moveAlertOpen && (
        <MoveBeerToCategory
          alertOpen={moveAlertOpen}
          checkedBeers={categoriesNotInCheckedBeers}
          setToMoveContinue={setToMoveContinue}
          setValues={setMoveCategory}
          setAlertOpen={setMoveAlertOpen}
        />
      )}

      <tr
        className={`lg:table-row  ${isOpen ? " bg-slate-200" : "shadow-sm"} ${
          categoryCheckBox ? "table-row__checked" : ""
        }`}
        key={index}
      >
        <th className={`${isOpen ? "rounded-tl-lg" : "rounded-l-lg"}`}>
          <label>
            <input
              type="checkbox"
              className="checkbox"
              onChange={handleCategoryCheck}
              checked={categoryCheckBox}
            />
          </label>
        </th>
        <td
          className={` hover:cursor-pointer p-6`}
          onClick={(e) => {
            handleOpen(index), e.stopPropagation();
          }}
        >
          <div className="flex items-center space-x-3 ">
            <LayoutGrid size={24} className="" strokeWidth={1} />

            <div>
              <div className="font-bold ">
                {category.name}{" "}
                <span className=" badge badge-ghost text-xs opacity-50">
                  {beersInCategory?.length || 0}
                </span>
              </div>
            </div>
          </div>
        </td>
        <td
          className={` hover:cursor-pointer`}
          onClick={() => handleOpen(index)}
        >
          <div className="badge badge-md badge-outline">
            {beersInCategory?.length || 0}
          </div>
        </td>

        <th>
          {categoryCheckBox &&
          (!beersInCategory || beersInCategory.length === 0) ? (
            <button
              onClick={() => handleDeleteAlert()}
              className="btn btn-circle bg-transparent border-none hover:bg-transparent"
            >
              <Trash2 size={24} strokeWidth={1} />
            </button>
          ) : (
            <button
              className={`btn btn-circle btn-ghost`}
              onClick={(e) => {
                e.stopPropagation(), handleOpen(index);
              }}
            >
              <PencilLine size={24} strokeWidth={1} />
            </button>
          )}
        </th>
        <th className={`${isOpen ? "rounded-tr-lg" : "rounded-r-lg"}`}></th>
      </tr>
      <tr className={`${isOpen ? "bg-slate-100 " : ""}`}>
        <td colSpan={5} className="rounded-b-lg">
          <div
            className={`collapse transition-all duration-300 overflow-hidden `}
          >
            <input type="checkbox" checked={isOpen} className="hidden" />

            <div className="collapse-content table  relative">
              <thead>
                <tr className="">
                  <th>
                    <label></label>
                  </th>
                  <th>Beer</th>
                  <th>Style</th>
                  <th>ABV%</th>
                  <th>Last Updated</th>
                  <th className="w-64 p-8"></th>
                  <th className="absolute right-0 top-0">
                    {isMoveAllButtonVisible && (
                      <button
                        className="btn btn-warning"
                        onClick={() => setMoveAlertOpen(true)}
                      >
                        <div
                          className="flex items-center"
                          title="Move beers to different Category"
                        >
                          <LogIn size={20} strokeWidth={1} />
                          <span className="inline-flex items-center">
                            <p className="m-1">Move</p>(
                            {checkedBeersCount[category._id] || 0})
                          </span>
                        </div>
                      </button>
                    )}

                    {isRemoveAllButtonVisible && (
                      <button
                        className={`btn btn-error ml-2`}
                        onClick={() => setAlertOpen(true)}
                      >
                        <div
                          className="flex items-center"
                          title="Remove beers from Category"
                        >
                          <Scissors size={20} strokeWidth={1} />
                          <span className="inline-flex items-center">
                            <p className="m-1">Remove</p>(
                            {checkedBeersCount[category._id] || 0})
                          </span>
                        </div>
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
                        handleBeerCheckbox(category._id, beerId, isChecked)
                      }
                      setAlertOpen={setAlertOpen}
                      setMoveAlertOpen={setMoveAlertOpen}
                      isChecked={
                        checkedBeers[category._id]?.[beer._id] || false
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
};
export default CategoryRow;
