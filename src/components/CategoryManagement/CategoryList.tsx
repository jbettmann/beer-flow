"use client";
import { Category } from "@/app/types/category";
import { useBreweryContext } from "@/context/brewery-beer";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import CategoryRow from "./CategoryRow";
import {
  ArrowDown01,
  ArrowDown10,
  ArrowDownAZ,
  ArrowDownZA,
  ArrowUp10,
  ArrowUpAZ,
  ArrowUpZA,
  Trash2,
} from "lucide-react";
import OnlyEmptyCategoryDelete from "../Alerts/OnlyEmptyCategoryDelete";
import deleteCategory from "@/lib/DELETE/deleteCategory";
import CreateNewCategoryRow from "./CreateNewCategoryRow";
import handleCreateNewCategory from "@/lib/handleSubmit/handleCreateNewCategory";
import { set } from "mongoose";
import { beerInCategory } from "@/lib/utils";
import { Beer } from "@/app/types/beer";

type Props = {};

const CategoryList = (props: Props) => {
  const { data: session } = useSession();
  const { selectedBeers, selectedBrewery, setSelectedBrewery } =
    useBreweryContext();

  const [categories, setCategories] = useState<Category[]>(
    selectedBrewery?.categories || []
  );

  const [isOpen, setIsOpen] = useState<boolean[]>(categories.map(() => false));

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
  const [creatingNewCategory, setCreatingNewCategory] = useState(false);

  // State to hold the sort order (true for ascending, false for descending)
  const [sortMethod, setSortMethod] = useState<string>("NAME");
  const [isAscending, setIsAscending] = useState(true);
  const [isNumberAscending, setIsNumberAscending] = useState(true);
  const [beersInCategory, setBeersInCategory] = useState<Beer[][]>([]);
  // sort the categories alphabetically
  const updateSortedCategories = () => {
    type CategoryWithBeers = {
      category: Category;
      beers: Beer[];
    };
    const categoriesWithBeers: CategoryWithBeers[] = categories.map(
      (category) => ({
        category,
        beers: beerInCategory(selectedBeers, category),
      })
    );

    categoriesWithBeers.sort((a, b) => {
      if (sortMethod === "NUMBER") {
        return isNumberAscending
          ? a.beers.length - b.beers.length
          : b.beers.length - a.beers.length;
      }
      // Default to name sorting
      return isAscending
        ? a.category.name.localeCompare(b.category.name)
        : b.category.name.localeCompare(a.category.name);
    });

    setBeersInCategory(categoriesWithBeers.map((item) => item.beers));
    setCategories(categoriesWithBeers.map((item) => item.category));
  };

  const handleSaveNewCategory = async (newCategoryName: string) => {
    if (newCategoryName.trim() === "") {
      setCreatingNewCategory(false);
      return;
    }
    if (newCategoryName && selectedBrewery) {
      const newCategoryId = await handleCreateNewCategory({
        categoryName: newCategoryName,
        brewery: selectedBrewery,
        accessToken: session?.user.accessToken || "",
      });
      console.log(newCategoryName);
      setSelectedBrewery((prev) => ({
        ...prev,
        categories: [
          { _id: newCategoryId, name: newCategoryName },
          ...prev.categories,
        ],
      }));
    }
    setCreatingNewCategory(false);
  };

  const handleCategoryCheckbox = (categoryId: string, isChecked: boolean) => {
    setCheckedCategories((prev) => ({
      ...prev,
      [categoryId]: isChecked,
    }));
  };

  // Function to handle the information from child component
  const handleEmptyCategory = (categoryId: string, isEmpty: boolean) => {
    setEmptyCategories((prev) => ({
      ...prev,
      [categoryId]: isEmpty,
    }));
  };

  const handleAlert = () => {
    // Find all the checked categories
    const checkedCategoryKeys = Object.keys(checkedCategories).filter(
      (key) => checkedCategories[key] === true
    );

    // Check if any of the checked categories have beers in them
    const hasBeerInCheckedCategory = checkedCategoryKeys.some(
      (key) => emptyCategories[key] === false
    );
    console.log({ checkedCategoryKeys, hasBeerInCheckedCategory });
    if (hasBeerInCheckedCategory) {
      // If any of the checked categories have beers, set the alert
      setOnlyEmptyAlert(true);
    } else {
      // If none of the checked categories have beers, handle deleting all categories
      handleDeleteSelectedCategories();
    }
  };

  // Call Remove or Move Beer to Category
  useEffect(() => {
    console.log("deleteConfirm changed:", deleteConfirm); // Debugging
    if (deleteConfirm) {
      handleDeleteSelectedCategories();
    }
  }, [deleteConfirm]);

  const handleDeleteSelectedCategories = () => {
    // Find all the checked categories
    const checkedCategoryIds = Object.keys(checkedCategories).filter(
      (key) => checkedCategories[key] === true
    );
    console.log("Checked categories: ", checkedCategoryIds);
    // Filter the checked categories to include only those that are also marked as empty
    const checkedAndEmptyCategoryIds = checkedCategoryIds.filter(
      (key) => emptyCategories[key] === true
    );

    console.log("Checked and empty categories: ", checkedAndEmptyCategoryIds);
    if (checkedAndEmptyCategoryIds && selectedBrewery) {
      try {
        checkedAndEmptyCategoryIds.forEach(async (categoryId) => {
          await deleteCategory({
            breweryId: selectedBrewery._id,
            categoryId,
            token: session?.user.accessToken || "",
          });
        });
        setSelectedBrewery((prev) => ({
          ...prev,
          categories: prev.categories.filter(
            (category) => !checkedAndEmptyCategoryIds.includes(category._id)
          ),
        }));
      } catch (error) {
        console.error(error);
        alert(error);
      }
    }
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
  // useEffect to call sortAlphabetically when isAscending changes
  useEffect(() => {
    updateSortedCategories();
  }, [isAscending, isNumberAscending]);

  useEffect(() => {
    setCategories(selectedBrewery?.categories || []);
  }, [selectedBrewery]);

  useEffect(() => {
    // Logging to check the initial data

    if (selectedBrewery) {
      // Update categories
      const updatedCategories = selectedBrewery.categories || [];
      setCategories(updatedCategories);

      // Calculate beersInCategory for each category
      const updatedBeersInCategory = updatedCategories.map((category) =>
        beerInCategory(selectedBeers, category)
      );
      setBeersInCategory(updatedBeersInCategory);
    }
  }, [selectedBrewery]);

  useEffect(() => {
    setAnyCategoriesChecked(
      Object.values(checkedCategories).some((isChecked) => isChecked) ||
        selectAll
    );
  }, [checkedCategories, selectAll]);

  return (
    <div className="overflow-x-auto">
      {onlyEmptyAlert && (
        <OnlyEmptyCategoryDelete
          alertOpen={onlyEmptyAlert}
          setAlertOpen={setOnlyEmptyAlert}
          setToContinue={setDeleteConfirm}
        />
      )}
      <table className="table relative">
        {/* head */}
        <thead>
          <tr>
            <th>
              <label>
                <input
                  type="checkbox"
                  className="checkbox"
                  onChange={handleSelectAll}
                  checked={selectAll}
                />
              </label>
            </th>
            <th>
              Name
              <span>
                <button
                  className="ml-2 "
                  onClick={() => {
                    setIsAscending(!isAscending);
                    setSortMethod("NAME");
                  }}
                >
                  {isAscending ? (
                    <ArrowDownAZ size={15} />
                  ) : (
                    <ArrowUpZA size={15} />
                  )}
                </button>
              </span>
            </th>
            <th>
              Beers Under Category{" "}
              <span>
                <button
                  className="ml-2 "
                  onClick={() => {
                    setIsNumberAscending(!isNumberAscending);
                    setSortMethod("NUMBER");
                  }}
                >
                  {isNumberAscending ? (
                    <ArrowDown01 size={15} />
                  ) : (
                    <ArrowUp10 size={15} />
                  )}
                </button>
              </span>
            </th>
            <th>
              <button
                className="btn btn-accent"
                onClick={() => setCreatingNewCategory(true)}
              >
                + New Category
              </button>
            </th>
            <th>
              {anyCategoriesChecked && (
                <button
                  onClick={() => handleAlert()}
                  className="btn btn-circle bg-transparent border-none hover:bg-transparent"
                >
                  <Trash2 size={24} strokeWidth={1} />
                </button>
              )}
            </th>
          </tr>
        </thead>
        <tbody>
          {/* row 1 */}
          {creatingNewCategory && (
            <CreateNewCategoryRow
              handleSaveNewCategory={handleSaveNewCategory}
              setCreatingNewCategory={setCreatingNewCategory}
            />
          )}
          {categories &&
            categories.map((category, index) => {
              return (
                <CategoryRow
                  category={category}
                  beersInCategory={beersInCategory[index]}
                  key={category._id}
                  index={index}
                  isOpen={isOpen[index]}
                  selectAll={selectAll}
                  handleEmptyCategory={handleEmptyCategory}
                  handleCategoryCheckbox={handleCategoryCheckbox}
                  handleOpen={handleOpen}
                />
              );
            })}
        </tbody>
        {/* foot */}
      </table>
    </div>
  );
};

export default CategoryList;
