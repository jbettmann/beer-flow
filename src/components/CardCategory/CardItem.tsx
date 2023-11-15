"use client";
import { Beer } from "@/app/types/beer";
import { Category } from "@/app/types/category";
import { Beer as BeerMug, Check, Flame, LogIn, Scissors } from "lucide-react";
import { useEffect, useState } from "react";
import AlertDialog from "../Alerts/AlertDialog";
import MoveBeerToCategory from "../Alerts/MoveBeerToCategory";
import { useBreweryContext } from "@/context/brewery-beer";
import { useSession } from "next-auth/react";
import { useToast } from "@/context/toast";
import { FormValues } from "../UpdateCategory/types";
import handleMoveBeerToCategory from "@/lib/handleSubmit/handleMoveBeerToCategory";
import updateBeerCategory from "@/lib/PUT/updateBeerCategory";
import useSWR from "swr";
import getBreweryBeers from "@/lib/getBreweryBeers";
import getSingleBrewery from "@/lib/getSingleBrewery";
import { Brewery } from "@/app/types/brewery";

type Props = {
  category: Category;
  beer: Beer;
  isChecked: boolean;
  handleCheckbox: (beerId: string, isChecked: boolean) => void;
};

const CardItem = ({ category, beer, handleCheckbox, isChecked }: Props) => {
  const isInMultipleCategories = beer.category && beer.category.length > 1;
  const [checked, setChecked] = useState(isChecked);
  const [removeSingleAlert, setRemoveSingleAlert] = useState<boolean>(false);
  const [moveSingleAlert, setMoveSingleAlert] = useState<boolean>(false);

  const [isRemoveLoading, setIsRemoveLoading] = useState<boolean>(false);
  const [isMoveLoading, setIsMoveLoading] = useState<boolean>(false);

  const [moveCategory, setMoveCategory] = useState<FormValues[] | []>([]);

  const { addToast } = useToast();
  const { data: session } = useSession();
  const {
    selectedBeers,
    selectedBrewery,
    setSelectedBeers,
    setSelectedBrewery,
  } = useBreweryContext();

  const { mutate } = useSWR(
    [
      `https://beer-bible-api.vercel.app/breweries/${selectedBrewery?._id}/beers`,
      session?.user.accessToken,
    ],
    getBreweryBeers
  );

  const { mutate: mutateBrewery } = useSWR(
    [
      `https://beer-bible-api.vercel.app/breweries/${selectedBrewery?._id}`,
      session?.user.accessToken,
    ],
    getSingleBrewery
  );

  // Remove beers from category
  const removeSingleBeersFromCategory = async (beerId: string) => {
    if (checked) {
      setIsRemoveLoading(true);
      try {
        // Determine which beers to update

        // Build an array of category IDs that don't include the one being removed
        const updatedCategoryId = beer.category
          .filter((cat) => cat._id !== category._id)
          .map((cat) => cat._id);

        const updateBeer = await updateBeerCategory({
          beerId,
          updatedCategory: updatedCategoryId,
          breweryId: selectedBrewery?._id,
          accessToken: session?.user.accessToken,
        });

        if (updateBeer) {
          // // Update the client state
          setSelectedBeers((prevSelectedBeers) => {
            if (!prevSelectedBeers) return null;
            // Iterate over the previous selected beers and create a new array

            return prevSelectedBeers.map((b: Beer) => {
              if (b._id === updateBeer._id) {
                return updateBeer; // Assuming `movedBeer` is the updated beer object.
              }
              return b;
            });
          });
          // Update cache
          mutate((prevData: Beer[]) => {
            if (!prevData) return null;
            return prevData.map((b: Beer) => {
              if (b._id === updateBeer._id) {
                return updateBeer;
              }
              return b;
            });
          });
          addToast(`${beer.name} was removed from ${category.name}`, "success");
        }
        handleClick();
      } catch (error: any) {
        addToast(error.message, "error");
        console.error(
          "An error occurred while removing beers from category:",
          error
        );
      } finally {
        setIsRemoveLoading(false);
        setRemoveSingleAlert(false);
      }
    }
    return;
  };

  // Move beers to category
  const moveSingleBeerToCategory = async () => {
    if (checked) {
      setIsMoveLoading(true);
      try {
        // Remove the current category and add the target category
        const updatedCategoryIds = beer.category
          .filter((cat) => cat._id !== category._id) // Exclude current category
          .map((cat) => cat._id);

        const movedBeer = await handleMoveBeerToCategory({
          values: moveCategory,
          beerId: beer._id,
          updatedCategory: updatedCategoryIds,
          brewery: selectedBrewery,
          accessToken: session?.user.accessToken,
        });

        // Identify the new categories that are not in the selectedBrewery.categories
        const newCategories: Category[] = [];
        beer.category.forEach((category) => {
          if (
            !selectedBrewery?.categories.some((cat) => cat._id === category._id)
          ) {
            newCategories.push(category);
          }
        });

        // NEED updatedBeers to return the updated beers with the new category
        // If there are new categories, update the selectedBrewery
        if (newCategories.length > 0) {
          setSelectedBrewery((prevBrewery) => {
            if (!prevBrewery) return null;
            return {
              ...prevBrewery,
              categories: [
                ...(prevBrewery?.categories || []),
                ...newCategories,
              ],
            };
          });
          // Update cache
          mutateBrewery((prevBrewery: Brewery) => {
            if (!prevBrewery) return null;
            return {
              ...prevBrewery,
              categories: [
                ...(prevBrewery?.categories || []),
                ...newCategories,
              ],
            };
          });
        }
        if (movedBeer) {
          // Update the client state with the newly updated beers
          setSelectedBeers((prevSelectedBeers: any) => {
            if (!prevSelectedBeers) return null;

            return prevSelectedBeers.map((b: Beer) => {
              if (b._id === beer._id) {
                return movedBeer; // Assuming `movedBeer` is the updated beer object.
              }
              return b;
            });
          });
          // Update cache
          mutate((prevData: Beer[]) => {
            if (!prevData) return null;
            return prevData.map((b: Beer) => {
              if (b._id === movedBeer?._id) {
                return movedBeer;
              }
              return b;
            });
          });
          addToast(
            `${beer.name} was moved to ${(moveCategory as any).category.map(
              (cat: any) => cat.value
            )}`,
            "success"
          );

          handleClick();
        }
      } catch (error: any) {
        addToast(error.message, "error");
        console.error("An error occurred while moving beers:", error);
      } finally {
        setMoveSingleAlert(false);
        setIsMoveLoading(false);
      }
    }
    return;
  };

  // detect source of click
  const handleClick = () => {
    // Ignore clicks on input or label elements

    const newChecked = !checked;
    setChecked(newChecked);
    handleCheckbox(beer._id, newChecked);
  };

  // Update the local state if the isChecked prop changes
  useEffect(() => {
    setChecked(isChecked);
  }, [isChecked]);

  return (
    <>
      {/*  Remove Beer From Category */}
      {removeSingleAlert && (
        <AlertDialog
          title="Remove Beer"
          message={`${beer.name} will be removed from ${category.name}`}
          isOpen={removeSingleAlert}
          onClose={() => setRemoveSingleAlert(false)}
          onConfirm={() => removeSingleBeersFromCategory(beer._id)}
          confirmButtonText="Remove"
        />
      )}

      {/* Move Beer to Category */}
      {moveSingleAlert && (
        <MoveBeerToCategory
          title="Move Beer"
          message={`${beer.name} will be moved to...`}
          checkedBeers={
            selectedBrewery?.categories.filter(
              (cat) => cat._id !== category._id
            ) as Category[]
          }
          setValues={setMoveCategory}
          onClose={() => setMoveSingleAlert(false)}
          onConfirm={moveSingleBeerToCategory}
          isOpen={moveSingleAlert}
          confirmButtonText="Move"
        />
      )}
      <div
        className={`flex justify-between items-center relative my-2 p-2 transition-all  ${
          checked ? "category-card__selected rounded-lg" : ""
        }`}
        onClick={handleClick}
      >
        <div className="hover:cursor-pointer px-2 py-6">
          <div className="flex items-center space-x-3 ">
            <label>
              <input type="checkbox" className="hidden" checked={checked} />
              {checked ? (
                <div className=" bg-primary rounded-full p-1">
                  <Check size={24} color="#f9fafb" />
                </div>
              ) : (
                <BeerMug size={24} strokeWidth={1} className="" />
              )}
            </label>

            <div>
              <div className="font-bold flex">
                {beer.name}
                {isInMultipleCategories && (
                  <span
                    className=" text-gray-600 cursor-pointer "
                    title={`Beer is in more than one category`}
                  >
                    <Flame size={12} strokeWidth={2} />
                  </span>
                )}
              </div>

              <div className="hover:cursor-pointer text-xs ">
                <div>{beer.style ? beer.style : null}</div>
              </div>
            </div>
          </div>
        </div>

        {checked ? (
          <div className="inline-flex justify-center items-center">
            {isInMultipleCategories && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setRemoveSingleAlert(true);
                }}
                className={`btn btn-circle ${
                  isChecked ? "btn-error " : "btn-disabled"
                } `}
              >
                {isRemoveLoading ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  <span title="Remove from Category">
                    <Scissors strokeWidth={1} size={20} />
                  </span>
                )}
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMoveSingleAlert(true);
              }}
              className={`btn btn-circle ml-2 ${
                isChecked ? "btn-warning" : "btn-disabled"
              } `}
            >
              {isMoveLoading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                <span title="Move to different Category">
                  <LogIn size={20} strokeWidth={1} />
                </span>
              )}
            </button>
          </div>
        ) : (
          <>
            <div
              className="hover:cursor-pointer text-base font-bold"
              onClick={handleClick}
            >
              <div>{beer.abv ? beer.abv + "%" : null} </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default CardItem;
