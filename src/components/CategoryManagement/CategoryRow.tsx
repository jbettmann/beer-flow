"use client";
import { Category } from "@/app/types/category";
import { useBreweryContext } from "@/context/brewery-beer";
import updateBeerCategory from "@/lib/PUT/updateBeerCategory";
import {
  ChevronDown,
  LayoutGrid,
  LogIn,
  PencilLine,
  Scissors,
  Trash,
  Trash2,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import CategoryItem from "./CategoryItem";

import { Beer } from "@/app/types/beer";
import { useToast } from "@/context/toast";
import handleMoveBeerToCategory from "@/lib/handleSubmit/handleMoveBeerToCategory";
import handleUpdateCategory from "@/lib/handleSubmit/handleUpdateCategory";
import { convertDate } from "@/lib/utils";
import AlertDialog from "../Alerts/AlertDialog";
import MoveBeerToCategory from "../Alerts/MoveBeerToCategory";
import BeerMugBadge from "../Badges/BeerMugBadge";
import { FormValues } from "../UpdateCategory/types";
import CategoryManagementLS from "../LoadingSkeleton/CategoryManagmentLS/CategoryManagementLS";
import TrashCanIcon from "../Buttons/TrashCanIcon";

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
  isChecked: boolean;
  isLoading: boolean;
};

const CategoryRow = ({
  category,
  index,
  isOpen,
  isLoading,
  isChecked,
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

  // category name change

  const [changeName, setChangeName] = useState<boolean>(false);
  const [categoryName, setCategoryName] = useState<string>(category.name);
  const { addToast } = useToast();
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
    const newCheckedState = !isChecked;

    handleCategoryCheckbox(category._id, newCheckedState);
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

  // Deselect all beers when the category is closed
  const deselectAllBeers = () => {
    if (!isOpen) {
      setCheckedBeers((prevCheckedBeers) => ({
        ...prevCheckedBeers,
        [category._id]: {},
      }));
      setCheckedBeersCount((prevCount) => ({
        ...prevCount,
        [category._id]: 0,
      }));
    }
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
        updatedBeers.flatMap((beer) => beer?.category.map((cat) => cat._id))
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
        setSelectedBrewery((prevBrewery) => {
          if (!prevBrewery) return null;
          return {
            ...prevBrewery,
            categories: [...(prevBrewery?.categories || []), ...newCategories],
          };
        });
      }
      // Update the client state with the newly updated beers
      setSelectedBeers((prevSelectedBeers) => {
        if (!prevSelectedBeers) return null;

        return prevSelectedBeers?.map((prevBeer: any) => {
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
      (category) => !checkedBeerCategories.includes(category._id as string)
    );

    return categoriesNotInCheckedBeers;
  };

  const categoriesNotInCheckedBeers = getCategoriesNotInCheckedBeers();

  // Changes name of category
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCategoryName(e.target.value);
  };
  //  Auto save for category name change
  const handleCategoryNameChange = async () => {
    if (categoryName !== "" && categoryName !== category.name) {
      try {
        let updatedCategory: Category = { ...category, name: categoryName };

        const updateName = await handleUpdateCategory({
          categoryId: category._id,
          updatedCategory,
          accessToken: session?.user.accessToken,
          setBreweryState: {
            selectedBeers,
            selectedBrewery,
            setSelectedBeers,
            setSelectedBrewery,
          },
        });

        if (updateName) {
          addToast("Category name has been updated", "success");
        }
      } catch (error: any) {
        console.error(error);
        addToast(error.error || error.message, "error");
      }
    }
    setChangeName(false);
  };
  //  Runs name change save on keydown "Enter"
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleCategoryNameChange();
      event.preventDefault(); // To prevent any default behavior, e.g., form submission
    }
  };

  const handleCannotDelete = () => {
    setTimeout(() => {
      addToast("Only empty categories can be deleted", "error");
    }, 200); // Show tooltip after 1 second of pressing
  };

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
    handleEmptyCategory(category._id, isEmpty);
    handleCategoryCheckbox(category._id, selectAll);
    console.log("selectAll changed", selectAll);
  }, [selectAll]);

  // Closes category if category checkbox is checked
  useEffect(() => {
    if (isOpen && isChecked) handleOpen(index);
    deselectAllBeers();
  }, [isChecked, isOpen]);

  return (
    <>
      {/*  Remove Beer From Category */}
      <AlertDialog
        title=""
        message={`Selected beers will be removed from ${category.name}`}
        isOpen={alertOpen}
        onClose={() => setAlertOpen(false)}
        onConfirm={() => setToContinue(true)}
      />

      {/* Move Beer to Category */}
      <MoveBeerToCategory
        title=""
        message={`Selected beers will be moved to:`}
        checkedBeers={categoriesNotInCheckedBeers as Category[]}
        setValues={setMoveCategory}
        onClose={() => setMoveAlertOpen(false)}
        onConfirm={() => setToMoveContinue(true)}
        isOpen={moveAlertOpen}
      />

      <tr
        className={` lg:table-row table-row__effect ${
          isOpen ? " category-card__open bg-stone-400 hover:shadow-none" : ""
        } ${isChecked ? "table-row__checked" : ""}`}
        key={index}
      >
        <th className={`${isOpen ? "rounded-tl-lg" : "rounded-l-lg"}`}>
          <label>
            <input
              type="checkbox"
              className="checkbox"
              onChange={handleCategoryCheck}
              checked={isChecked}
            />
          </label>
        </th>
        <td
          className={` hover:cursor-pointer p-6`}
          onClick={(e) => {
            if (isChecked) return;
            handleOpen(index), e.stopPropagation();
          }}
        >
          <div className="flex items-center space-x-3 ">
            <LayoutGrid size={24} className="" strokeWidth={1} />

            <div className="font-bold flex justify-start items-center w-full ">
              {changeName ? (
                <input
                  type="text"
                  value={categoryName}
                  onChange={handleInputChange}
                  name="name"
                  id="name"
                  className="form__input"
                  autoFocus
                  onBlur={handleCategoryNameChange}
                  onKeyDown={handleKeyPress}
                />
              ) : (
                category.name
              )}
              <span className=" inline-flex  justify-center items-center p-1 text-xs w-12 h-14 relative overflow-hidden">
                {!changeName && (
                  <button
                    className="btn btn-ghost disabled:bg-transparent"
                    onClick={() => setChangeName(true)}
                    disabled={isChecked ? false : true}
                  >
                    <PencilLine
                      size={20}
                      className={`absolute transition-transform duration-300 ${
                        isChecked
                          ? "translate-y-0 opacity-100"
                          : "translate-y-full opacity-0 "
                      }`}
                    />
                  </button>
                )}
              </span>
            </div>
          </div>
        </td>
        <td
          className={`  hover:cursor-pointer`}
          onClick={() => {
            if (isChecked) return;
            handleOpen(index);
          }}
        >
          <div className="w-1/6">
            <BeerMugBadge
              className="h-8 w-10"
              beerCount={beersInCategory?.length || 0}
            />
          </div>
        </td>

        <th>
          <div>
            <p className="font-normal">{convertDate(category.createdAt)}</p>
          </div>
        </th>

        <th className={`${isOpen ? "rounded-tr-lg" : "rounded-r-lg"}`}>
          <div className="flex justify-center items-center w-full ">
            {isChecked ? (
              !beersInCategory || beersInCategory.length === 0 ? (
                <TrashCanIcon
                  title="Delete category"
                  onClick={handleDeleteAlert}
                  isLoading={isLoading}
                />
              ) : (
            
                  <button
                    className="relative"
                    title="Only empty categories can be deleted"
                    onClick={handleCannotDelete}
                  >
                    <Trash2
                      size={24}
                      strokeWidth={1}
                      className="text-stone-400"
                    />
                  </button>
            
              )
            ) : (
              <button
                onClick={(e) => {
                  if (isChecked) return;
                  e.stopPropagation(), handleOpen(index);
                }}
                className={`flex items-center transform transition-transform duration-300 ${
                  isOpen ? "rotate-180" : "rotate-0"
                }`}
              >
                <ChevronDown />
              </button>
            )}
          </div>
        </th>
      </tr>
      <tr
        className={`${
          isOpen ? "category-card__open shadow-lg rounded-lg" : ""
        }`}
      >
        <td colSpan={5} className="rounded-b-lg">
          <div
            className={`collapse transition-all duration-300 overflow-hidden `}
          >
            <input type="checkbox" checked={isOpen} className="hidden" />

            <table className="collapse-content  border-separate border-spacing-y-6 relative">
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
                  <th className="absolute right-0 top-3 p-0">
                    {isMoveAllButtonVisible && (
                      <button
                        className="btn btn-ghost btn-sm text-primary hover:btn-warning"
                        onClick={() => setMoveAlertOpen(true)}
                      >
                        <div
                          className="flex items-center"
                          title="Move beers to different Category"
                        >
                          <LogIn size={20} strokeWidth={1} />
                          <span className="flex items-center justify-center text-xs">
                            <p className=" m-0 ml-1">Move</p>
                            <p className=" m-0 ml-1">
                              ({checkedBeersCount[category._id] || 0})
                            </p>
                          </span>
                        </div>
                      </button>
                    )}

                    {isRemoveAllButtonVisible && (
                      <button
                        className={`btn btn-ghost btn-sm text-primary hover:btn-error  ml-2`}
                        onClick={() => setAlertOpen(true)}
                      >
                        <div
                          className="flex items-center"
                          title="Remove beers from Category"
                        >
                          <Scissors size={20} strokeWidth={1} />
                          <span className="flex items-center justify-center text-xs">
                            <p className=" m-0 ml-1">Remove</p>
                            <p className=" m-0 ml-1">
                              ({checkedBeersCount[category._id] || 0})
                            </p>
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
                      isOpen={isOpen}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={5}>
                      <div className="flex items-center justify-center w-full h-20 text-primary0">
                        <p className="text-xl font-bold text-center">
                          No beers in this category
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </td>
      </tr>
    </>
  );
};
export default CategoryRow;
