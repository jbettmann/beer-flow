"use client";
import { Beer } from "@/app/types/beer";
import { Category, NewCategory } from "@/app/types/category";
import { useBreweryContext } from "@/context/brewery-beer";
import deleteCategory from "@/lib/DELETE/deleteCategory";
import handleCreateNewCategory from "@/lib/handleSubmit/handleCreateNewCategory";

import { MoveDown, MoveUp, Trash2, ListFilter } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useRef, useState } from "react";
import OnlyEmptyCategoryDelete from "../Alerts/OnlyEmptyCategoryDelete";
import CategoryRow from "./CategoryRow";
import CreateNewCategoryRow from "./CreateNewCategoryRow";

import { Brewery } from "@/app/types/brewery";
import CardCategory from "../CardCategory/CardCategory";
import { useOnClickOutside } from "usehooks-ts";
import cn from "classnames";
import CreateNewCategoryCard from "../CardCategory/CreateNewCategoryCard";
import { useToast } from "@/context/toast";

type Props = {
  createNewCategory: boolean;
  setCreateNewCategory: React.Dispatch<React.SetStateAction<boolean>>;
  viewFilter: string;
};

const CategoryList = ({
  createNewCategory,
  setCreateNewCategory,
  viewFilter,
}: Props) => {
  const { data: session } = useSession();
  const { selectedBeers, selectedBrewery, setSelectedBrewery } =
    useBreweryContext();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { addToast } = useToast();
  const [isEdit, setIsEdit] = useState<boolean>(false);

  const [categories, setCategories] = useState<Category[] | NewCategory[]>(
    selectedBrewery?.categories || []
  );

  const [isOpen, setIsOpen] = useState<boolean[]>(categories.map(() => false));
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);

  const [selectAll, setSelectAll] = useState(false); // select all checkbox
  // State to track categories that are empty (have no beers)
  const [emptyCategories, setEmptyCategories] = useState<
    Record<string, boolean>
  >({});

  const [onlyEmptyAlert, setOnlyEmptyAlert] = useState<boolean>(false);
  const [deleteConfirm, setDeleteConfirm] = useState<boolean>(false);

  const [checkedCategories, setCheckedCategories] = useState<
    Record<string, boolean>
  >({});
  const [anyCategoriesChecked, setAnyCategoriesChecked] = useState(
    Object.values(checkedCategories).some((isChecked) => isChecked) || selectAll
  );

  // State to hold the sort order (true for ascending, false for descending)
  const [sortMethod, setSortMethod] = useState<string>("");
  const [isAlphabetical, setIsAlphabetical] = useState<boolean | null>(null);
  const [isNumberAscending, setIsNumberAscending] = useState<boolean | null>(
    null
  );
  const [isCreateFilter, setIsCreateFilter] = useState<boolean | null>(null);

  const [beersInCategory, setBeersInCategory] = useState<Beer[][]>([]);

  //close the dropdown when clicking outside the referenced element
  const ref = useRef<HTMLDivElement>(null);

  // Filter menu options for small screen
  const menuButtons = [
    {
      title: "A-Z",
      setFilterState: (sort: string) => {
        if (sort === sortMethod) {
          setIsAlphabetical(true);
          return;
        }
        setSortMethod(sort);
        setIsAlphabetical(true);
      },
      type: "NAME",
    },
    {
      title: "Z-A",
      setFilterState: (sort: string) => {
        if (sort === sortMethod) {
          setIsAlphabetical(false);
          return;
        }
        setSortMethod(sort);
        setIsAlphabetical(false);
      },
      type: "NAME",
    },

    {
      title: "More Beer",
      setFilterState: (sort: string) => {
        if (sort === sortMethod) {
          setIsNumberAscending(false);
          return;
        }
        setSortMethod(sort);
        setIsNumberAscending(false);
      },
      type: "NUMBER",
    },
    {
      title: "Less Beer",
      setFilterState: (sort: string) => {
        if (sort === sortMethod) {
          setIsNumberAscending(true);
          return;
        }
        setSortMethod(sort);
        setIsNumberAscending(true);
      },
      type: "NUMBER",
    },
    {
      title: "Newest",
      setFilterState: (sort: string) => {
        if (sort === sortMethod) {
          setIsCreateFilter(true);
          return;
        }
        setSortMethod(sort);
        setIsCreateFilter(true);
      },
      type: "CREATE",
    },
    {
      title: "Oldest",
      setFilterState: (sort: string) => {
        if (sort === sortMethod) {
          setIsCreateFilter(false);
          return;
        }
        setSortMethod(sort);
        setIsCreateFilter(false);
      },
      type: "CREATE",
    },
  ];
  // sort the categories alphabetically

  const beerInCategory = (
    beers: Beer[] | null,
    category: Category | NewCategory
  ) => {
    return (
      beers?.filter((beer) => {
        return beer.category
          ? beer.category.some((cat) => cat.name === category.name)
          : false;
      }) ?? []
    );
  };

  // useMemo for expensive calculations
  const categoriesWithBeers = useMemo(() => {
    if (selectedBeers) {
      return categories.map((category) => ({
        category,
        beers: beerInCategory(selectedBeers, category),
      }));
    } else {
      return [];
    }
  }, [categories, selectedBeers]);

  const updateSortedCategories = () => {
    let sortedCategoriesWithBeers = [...categoriesWithBeers];
    if (sortMethod === "NUMBER") {
      if (isAlphabetical) setIsAlphabetical(false);
      if (isCreateFilter) setIsCreateFilter(false);
      sortedCategoriesWithBeers.sort((a, b) =>
        isNumberAscending
          ? (a.beers as any).length - (b.beers as any).length
          : (b.beers as any).length - (a.beers as any).length
      );
    } else if (sortMethod === "CREATE") {
      if (isAlphabetical) setIsAlphabetical(false);
      if (isNumberAscending) setIsNumberAscending(false);
      sortedCategoriesWithBeers.sort((a, b) =>
        isCreateFilter
          ? (b.category as Category).createdAt!.localeCompare(
              (a.category as Category).createdAt!
            )
          : (a.category as Category).createdAt!.localeCompare(
              (b.category as Category).createdAt!
            )
      );
    } else {
      if (isNumberAscending) setIsNumberAscending(false);
      if (isCreateFilter) setIsCreateFilter(false);
      sortedCategoriesWithBeers.sort((a, b) =>
        isAlphabetical
          ? a.category.name.localeCompare(b.category.name)
          : b.category.name.localeCompare(a.category.name)
      );
    }
    setBeersInCategory(
      sortedCategoriesWithBeers.map((item) => item.beers as Beer[])
    );
    setCategories(sortedCategoriesWithBeers.map((item) => item.category));
  };

  const handleSaveNewCategory = async (newCategoryName: string) => {
    setIsLoading(true);
    if (newCategoryName.trim() === "") {
      setCreateNewCategory(false);
      return;
    }
    if (newCategoryName && selectedBrewery) {
      const newCategoryId = await handleCreateNewCategory({
        categoryName: newCategoryName,
        brewery: selectedBrewery,
        accessToken: session?.user.accessToken || "",
      });

      setSelectedBrewery((prev) => {
        if (prev === null) {
          return null;
        }

        return {
          ...prev,
          categories: [
            { _id: newCategoryId, name: newCategoryName },
            ...prev.categories,
          ],
        };
      });
    }
    setIsLoading(false);
    setCreateNewCategory(false);
  };

  const handleCategoryCheckbox = (categoryId: string, isChecked: boolean) => {
    setCheckedCategories((prev) => ({
      ...prev,
      [categoryId]: isChecked,
    }));
  };

  //  Deselect All selected categories when cancel button clicked in edit view
  const handleDeselectedAllCategories = () => {
    if (Object.values(checkedCategories).some((value) => value)) {
      const updatedCheckCats = Object.fromEntries(
        Object.keys(checkedCategories).map((key) => [key, false])
      );
      setCheckedCategories(updatedCheckCats);
    }
    setIsEdit(false);
  };

  // Function to handle the information from child component
  const handleEmptyCategory = (categoryId: string, isEmpty: boolean) => {
    setEmptyCategories((prev) => ({
      ...prev,
      [categoryId]: isEmpty,
    }));
  };

  const handleDeleteAlert = () => {
    // Find all the checked categories
    const checkedCategoryKeys = Object.keys(checkedCategories).filter(
      (key) => checkedCategories[key] === true
    );

    // Check if any of the checked categories have beers in them
    const hasBeerInCheckedCategory = checkedCategoryKeys.some(
      (key) => emptyCategories[key] === false
    );

    if (hasBeerInCheckedCategory) {
      // If any of the checked categories have beers, set the alert
      setOnlyEmptyAlert(true);
    } else {
      // If none of the checked categories have beers, handle deleting all categories
      handleDeleteSelectedCategories();
    }
  };

  const handleDeleteSelectedCategories = () => {
    setIsLoading(true);
    // Find all the checked categories
    const checkedCategoryIds = Object.keys(checkedCategories).filter(
      (key) => checkedCategories[key] === true
    );

    // Filter the checked categories to include only those that are also marked as empty
    const checkedAndEmptyCategoryIds = checkedCategoryIds.filter(
      (key) => emptyCategories[key] === true
    );

    if (checkedAndEmptyCategoryIds && selectedBrewery) {
      try {
        const deletedCategory = checkedAndEmptyCategoryIds.forEach(
          async (categoryId) => {
            await deleteCategory({
              breweryId: selectedBrewery._id,
              categoryId,
              token: session?.user.accessToken || "",
            });
          }
        );

        setSelectedBrewery((prev) => {
          if (prev === null) {
            return null;
          }
          return {
            ...prev,
            categories: prev.categories.filter(
              (category) =>
                !checkedAndEmptyCategoryIds.includes(category._id as string)
            ),
          };
        });
        addToast("Category Deleted", "success");
      } catch (error: any) {
        console.error(error);
        addToast(error.message, "error");
      }
    }
    setIsLoading(false);
    setDeleteConfirm(false); // Reset deleteConfirm state
    // Add code here to delete the categories by ID
  };

  const handleOpen = (index: number) => {
    const newIsOpen = [...isOpen];
    newIsOpen[index] = !newIsOpen[index];
    setIsOpen(newIsOpen);
  };

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
  };

  // closing the dropdown when clicking outside the dropdown
  useOnClickOutside(ref, () => setIsFilterOpen(false));

  //onclick handler when clicking a menu item
  const handleClick = () => {
    setIsFilterOpen(false);
  };

  useEffect(() => {
    if (selectedBrewery && selectedBeers) {
      let newCategories: NewCategory[] = [];
      let newBeersInCategory = [];

      if (viewFilter === "All") {
        newCategories = selectedBrewery.categories || [];
        newBeersInCategory = newCategories.map((category) =>
          beerInCategory(selectedBeers, category)
        );
      } else if (viewFilter === "Empty") {
        newCategories = selectedBrewery.categories.filter(
          (category) => beerInCategory(selectedBeers, category)?.length === 0
        );
        newBeersInCategory = newCategories.length as any;
      }

      setCategories(newCategories);
      setBeersInCategory(newBeersInCategory);
    }
  }, [viewFilter, selectedBeers, selectedBrewery]);

  // Call Remove or Move Beer to Category
  useEffect(() => {
    if (deleteConfirm) {
      handleDeleteSelectedCategories();
    }
  }, [deleteConfirm]);

  // useEffect to call sortAlphabetically when isAlphabetical changes
  useEffect(() => {
    updateSortedCategories();
  }, [isAlphabetical, isNumberAscending, isCreateFilter]);

  useEffect(() => {
    updateSortedCategories();
  }, []);

  useEffect(() => {
    setAnyCategoriesChecked(
      Object.values(checkedCategories).some((isChecked) => isChecked) ||
        selectAll
    );
  }, [checkedCategories, selectAll]);

  return (
    <div className=" flex-auto text-primary">
      {onlyEmptyAlert && (
        <OnlyEmptyCategoryDelete
          alertOpen={onlyEmptyAlert}
          setAlertOpen={setOnlyEmptyAlert}
          setToContinue={setDeleteConfirm}
        />
      )}
      {/* Small Screen Filter and Edit */}
      <div
        className={`lg:hidden flex justify-between sticky top-0 l z-20 bg-background xxs:px-4 w-full`}
      >
        {isEdit ? (
          <>
            <label className="flex items-center ">
              <input
                type="checkbox"
                className="checkbox   ml-1 mr-2 "
                onChange={handleSelectAll}
                checked={selectAll}
              />
              Select All
            </label>
            <button
              className={`btn btn-circle btn-ghost text-primary`}
              onClick={handleDeselectedAllCategories}
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              className={`btn btn-circle btn-ghost`}
              onClick={(e) => setIsEdit(true)}
            >
              Edit
            </button>
            <div
              ref={ref}
              className={`lg:hidden flex-initial z-[1] dropdown-end bg-transparent lg:z-0 ${cn(
                {
                  dropdown: true,
                  "dropdown-open ": isFilterOpen,
                }
              )}`}
            >
              <label
                className="btn btn-ghost  w-full"
                tabIndex={0}
                onClick={() => setIsFilterOpen((prev) => !prev)}
              >
                <ListFilter size={20} />
              </label>
              <ul
                tabIndex={0}
                className={cn({
                  "dropdown-content menu p-2 shadow rounded-box bg-primary text-background":
                    true,
                  hidden: !isFilterOpen,
                })}
              >
                {menuButtons.map((button, i) => (
                  <li key={i}>
                    <button
                      className="btn btn-ghost "
                      onClick={() => {
                        handleClick();
                        button.setFilterState(button.type);
                      }}
                    >
                      {button.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
      {/* Large Screen Table Layout  */}
      <table
        className={`hidden lg:table border-separate border-spacing-y-0 p-3 relative`}
      >
        {/* head */}
        <thead>
          <tr>
            <th className="text-stone-500">
              <label>
                <input
                  type="checkbox"
                  className="checkbox"
                  onChange={handleSelectAll}
                  checked={selectAll}
                />
              </label>
            </th>
            <th className="text-stone-500  ">
              Name
              <span>
                <button
                  className="ml-2 "
                  onClick={() => {
                    setIsAlphabetical(!isAlphabetical);
                    setSortMethod("NAME");
                  }}
                >
                  {isAlphabetical ? (
                    <MoveDown size={13} />
                  ) : (
                    <MoveUp size={13} />
                  )}
                </button>
              </span>
            </th>
            <th className="text-stone-500 ">
              Amount
              <span>
                <button
                  className="ml-2 "
                  onClick={() => {
                    setIsNumberAscending(!isNumberAscending);
                    setSortMethod("NUMBER");
                  }}
                >
                  {isNumberAscending ? (
                    <MoveDown size={13} />
                  ) : (
                    <MoveUp size={13} />
                  )}
                </button>
              </span>
            </th>
            <th className="text-stone-500 ">
              Created
              <span>
                <button
                  className="ml-2 "
                  onClick={() => {
                    setIsCreateFilter(!isCreateFilter);
                    setSortMethod("CREATE");
                  }}
                >
                  {isCreateFilter ? (
                    <MoveDown size={13} />
                  ) : (
                    <MoveUp size={13} />
                  )}
                </button>
              </span>
            </th>

            <th className="text-stone-500"></th>
          </tr>
        </thead>
        <tbody>
          {/* row 1 */}
          {createNewCategory && (
            <CreateNewCategoryRow
              handleSaveNewCategory={handleSaveNewCategory}
              setCreateNewCategory={setCreateNewCategory}
              isLoading={isLoading}
            />
          )}
          {categories &&
            categories.map((category, index) => {
              return (
                <CategoryRow
                  category={category as Category}
                  beersInCategory={beersInCategory[index]}
                  key={category._id}
                  index={index}
                  isOpen={isOpen[index]}
                  isChecked={checkedCategories[category._id as any]}
                  selectAll={selectAll}
                  handleEmptyCategory={handleEmptyCategory}
                  handleCategoryCheckbox={handleCategoryCheckbox}
                  handleOpen={handleOpen}
                  handleDeleteAlert={handleDeleteAlert}
                />
              );
            })}
        </tbody>
        {/* foot */}
      </table>

      {/* Small Screen Card Layout*/}
      <div className=" lg:hidden flex flex-col p-3 relative">
        <div className="flex flex-col gap-8">
          {/* row 1 */}
          {createNewCategory && (
            <CreateNewCategoryCard
              isLoading={isLoading}
              handleSaveNewCategory={handleSaveNewCategory}
              setCreateNewCategory={setCreateNewCategory}
            />
          )}
          {categories.length > 0 && categories ? (
            categories.map((category, index) => {
              return (
                <CardCategory
                  category={category}
                  beersInCategory={beersInCategory[index]}
                  isChecked={checkedCategories[category._id as any]}
                  key={category._id}
                  index={index}
                  isEdit={isEdit}
                  isOpen={isOpen[index]}
                  selectAll={selectAll}
                  handleEmptyCategory={handleEmptyCategory}
                  handleCategoryCheckbox={handleCategoryCheckbox}
                  handleOpen={handleOpen}
                  handleDeleteAlert={handleDeleteAlert}
                />
              );
            })
          ) : (
            <div className="mx-auto text-primary text-opacity-50">
              There are no empty categories
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryList;
