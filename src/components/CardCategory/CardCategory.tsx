"use client";
import { Category, NewCategory } from "@/types/category";
import { useBreweryContext } from "@/context/brewery-beer";
import { ChevronDown, LayoutGrid, PencilLine, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import { Beer } from "@/types/beer";
import { useToast } from "@/context/toast";
import handleUpdateCategory from "@/lib/handleSubmit/handleUpdateCategory";
import BeerMugBadge from "../Badges/BeerMugBadge";

import SaveButton from "../Buttons/SaveButton";
import TrashCanIcon from "../Buttons/TrashCanIcon";
import CardItem from "./CardItem";

type Props = {
  category: Category | NewCategory | any;
  isEdit: boolean;
  index: number;
  isOpen: boolean;
  handleOpen: (index: number) => void;
  selectAll: boolean;
  handleEmptyCategory: (categoryId: string, isEmpty: boolean) => void;
  handleCategoryCheckbox: (categoryId: string, isChecked: boolean) => void;
  beersInCategory: Beer[];
  handleDeleteAlert: () => void;
  isChecked: boolean;
};

const CardCategory = ({
  category,
  index,
  isEdit,
  isOpen,
  isChecked,

  handleOpen,
  selectAll,
  handleEmptyCategory,
  handleCategoryCheckbox,
  beersInCategory,
  handleDeleteAlert,
}: Props) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [checkedBeers, setCheckedBeers] = useState<
    Record<string, Record<string, boolean>>
  >({});
  const [checkedBeersCount, setCheckedBeersCount] = useState<
    Record<string, number>
  >({});

  // category name change
  const [changeName, setChangeName] = useState<boolean>(false);
  const [categoryName, setCategoryName] = useState<string>(category.name);

  const { data: session } = useSession();
  const { addToast } = useToast();
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
      setIsLoading(true);
      try {
        let updatedCategory: any = { ...category, name: categoryName };

        const updateName = await handleUpdateCategory({
          categoryId: category._id as string,
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
    setIsLoading(false);
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
    setIsEmpty(calculateIsEmpty());
  }, [selectedBeers]);

  const handleCategoryCheck = () => {
    if (changeName) {
      setChangeName(false);
    }
    const newCheckedState = !isChecked;
    handleCategoryCheckbox(category._id, newCheckedState);
  };

  useEffect(() => {
    handleEmptyCategory(category._id, isEmpty);
  }, [isEmpty]);

  // Update the isCheckedstate when selectAll changes
  useEffect(() => {
    handleEmptyCategory(category._id, isEmpty);
    handleCategoryCheckbox(category._id, selectAll);
  }, [selectAll]);

  // Closes category if category checkbox is checked
  useEffect(() => {
    if (isOpen && isChecked) handleOpen(index);
    if (isOpen && isEdit) handleOpen(index);
    if (!isEdit && changeName) setChangeName(false);
    deselectAllBeers();
  }, [isChecked, isEdit, isOpen]);

  return (
    <>
      <div
        className={`card category-card transition-colors duration-75  relative py-8 ${
          isOpen ? "  category-card__open  shadow-2xl" : " "
        } ${isChecked ? "category-card__selected" : ""} ${
          changeName ? " pb-14 " : ""
        } ${isEdit ? "category-card__edit" : ""} `}
        key={category._id}
      >
        <div
          className={`flex justify-between hover:cursor-pointer p-6 `}
          onClick={(e) => {
            if (isEdit) return;
            else handleOpen(index), e.stopPropagation();
          }}
        >
          <div className="flex justify-center items-center space-x-3">
            <label className="flex items-center relative h-8 w-10 overflow-hidden ">
              {/* Adjust the height and width based on your requirements */}
              {/* Checkbox */}
              <input
                type="checkbox"
                className={`checkbox absolute transition-transform duration-300 ${
                  isEdit
                    ? "translate-y-0 opacity-100"
                    : "translate-y-full opacity-0 "
                }`}
                onClick={handleCategoryCheck}
                checked={isChecked}
                disabled={isEdit ? false : true}
              />

              {/* LayoutGrid */}
              <LayoutGrid
                size={24}
                className={`absolute transition-transform duration-300 ${
                  isEdit
                    ? "-translate-y-full opacity-0"
                    : "translate-y-0 opacity-100"
                }`}
                strokeWidth={1}
              />
            </label>

            <div className="font-bold flex justify-center items-center w-full ">
              {changeName ? (
                <>
                  <input
                    type="text"
                    value={categoryName}
                    onChange={handleInputChange}
                    name="name"
                    id="name"
                    className="category__input"
                    autoFocus
                    onKeyDown={handleKeyPress}
                  />

                  <div className="flex gap-3 absolute bottom-4 right-0 px-8 ">
                    <button
                      className="btn btn-ghost text-primary " // Made the button more visible
                      onClick={() => setChangeName(false)}
                    >
                      Cancel
                    </button>
                    <SaveButton
                      isLoading={isLoading}
                      disabled={category.name === categoryName ? true : false}
                      onClick={handleCategoryNameChange}
                    />
                  </div>
                </>
              ) : (
                category.name
              )}
              {!changeName && (
                <span className=" inline-flex  justify-center items-center p-1 text-xs w-12 h-14 relative overflow-hidden">
                  <BeerMugBadge
                    beerCount={beersInCategory?.length || 0}
                    className={` absolute transition-transform duration-300 ${
                      isEdit
                        ? "-translate-y-full opacity-0"
                        : "translate-y-0 opacity-100"
                    }`}
                  />

                  <button
                    className="btn btn-ghost disabled:bg-transparent"
                    onClick={() => setChangeName(true)}
                    disabled={isEdit ? false : true}
                  >
                    <PencilLine
                      size={20}
                      strokeWidth={1}
                      className={`absolute  transition-transform duration-300 ${
                        isEdit
                          ? "translate-y-0 opacity-100"
                          : "translate-y-full opacity-0 "
                      }`}
                    />
                  </button>
                </span>
              )}
            </div>
          </div>
          {isChecked && !changeName ? (
            !beersInCategory || beersInCategory.length === 0 ? (
              <TrashCanIcon onClick={handleDeleteAlert} isLoading={isLoading} />
            ) : (
              <button
                className="relative"
                title="Only empty categories can be deleted"
                onClick={handleCannotDelete}
              >
                <Trash2 size={24} strokeWidth={1} className="text-stone-400" />
              </button>
            )
          ) : (
            !changeName &&
            !isEdit && (
              <span
                className={`flex items-center transform transition-transform duration-300 ${
                  isOpen ? "rotate-180" : "rotate-0"
                }`}
              >
                <ChevronDown />
              </span>
            )
          )}
        </div>

        <div className="text-primary relative">
          <div
            className={`collapse transition-all duration-300 overflow-hidden `}
          >
            <input type="checkbox" checked={isOpen} className="hidden" />

            <div className="collapse-content  ">
              <div className="absolute right-0 bottom-0 inline-flex items-center"></div>
              <div className="py-2">
                {beersInCategory?.length > 0 ? (
                  beersInCategory?.map((beer, i) => (
                    <>
                      <CardItem
                        key={beer._id}
                        beer={beer}
                        category={category}
                        handleCheckbox={(beerId, isChecked) =>
                          handleBeerCheckbox(category._id, beerId, isChecked)
                        }
                        isChecked={
                          checkedBeers[category._id]?.[beer._id] || false
                        }
                      />
                    </>
                  ))
                ) : (
                  <div>
                    <div>
                      <div className="flex items-center justify-center w-full h-20 text-primary">
                        <p className="text-xl font-bold text-center">
                          No beers in this category
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CardCategory;
