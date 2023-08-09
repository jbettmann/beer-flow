"use client";
import { Category } from "@/app/types/category";
import { useBreweryContext } from "@/context/brewery-beer";
import { Check, Library, LogIn, Move, Scissors } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import RemoveBeerFromCategory from "../Alerts/RemoveBeerFromCategory";
import CategoryItem from "./CategoryItem";
import updateBeerCategory from "@/lib/PUT/updateBeerCategory";
import { set } from "mongoose";
import MoveBeerToCategory from "../Alerts/MoveBeerToCategory";

type Props = {
  category: Category;
  index: number;
  isOpen: boolean;
  handleOpen: (index: number) => void;
};

const CategoryRow = ({ category, index, isOpen, handleOpen }: Props) => {
  
  const [toContinue, setToContinue] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const { data: session } = useSession();
  const { selectedBeers, selectedBrewery, setSelectedBeers } =
    useBreweryContext();
  const [checkedBeers, setCheckedBeers] = useState<
    Record<string, Record<string, boolean>>
  >({});
  const [checkedBeersCount, setCheckedBeersCount] = useState<
    Record<string, number>
  >({});

  const handleCheckbox = (
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

  useEffect(() => {
    if (toContinue) {
      removeBeersFromCategory(category._id);
    }
  }, [toContinue]);

  const removeBeersFromCategory = async (categoryId: string) => {
    try {
      // Determine which beers to update
      const beerIdsToUpdate = Object.keys(
        checkedBeers[categoryId] || {}
      ).filter((beerId) => checkedBeers[categoryId][beerId]);

      if (beerIdsToUpdate.length === 0) return; // No beers to update

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
      const updatedBeers = await Promise.all(updatedBeersRequests);

      // Update the client state
      setSelectedBeers((prevSelectedBeers) => {
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
    }
  };

  // Filter the beers that belong to this category
  const beersInCategory = selectedBeers?.filter((beer) => {
    return beer.category
      ? beer.category.some((cat) => cat.name === category.name)
      : false;
  });
  // Get the state for the buttons specific to this category
  const { isMoveAllButtonVisible, isRemoveAllButtonVisible } = getButtonsState(
    category._id
  );

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
      {alertOpen && (
        <MoveBeerToCategory
          category={category}
          setToContinue={setToContinue}
          setAlertOpen={setAlertOpen}
        />
      )}
      <tr
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
        <td colSpan={4}>
          <div
            className={`collapse transition-all duration-300 overflow-hidden ${
              isOpen ? "max-h-[500px]" : "max-h-0"
            } `}
          >
            <input type="checkbox" checked={isOpen} className="hidden" />

            <div className="collapse-content table table-zebra relative">
              <thead>
                <tr className="">
                  <th>
                    <label></label>
                  </th>
                  <th>Beer</th>
                  <th>Category</th>
                  <th className="w-64 p-8"></th>
                  <th className="absolute right-0 top-0">
                    {isMoveAllButtonVisible && (
                      <button
                        className="btn btn-warning"
                        onClick={() => handleCommonAction("Move")}
                      >
                        <div
                          className="flex items-center"
                          title="Move beers to different Category"
                        >
                          <LogIn size={20} />
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
                          <Scissors size={20} />
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
                        handleCheckbox(category._id, beerId, isChecked)
                      }
                      setAlertOpen={setAlertOpen}
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
