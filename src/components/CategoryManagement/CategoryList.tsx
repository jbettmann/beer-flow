"use client";
import { Category } from "@/app/types/category";
import { useBreweryContext } from "@/context/brewery-beer";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import CategoryRow from "./CategoryRow";
import { Trash2 } from "lucide-react";
import OnlyEmptyCategoryDelete from "../Alerts/OnlyEmptyCategoryDelete";
import deleteCategory from "@/lib/DELETE/deleteCategory";
import CreateNewCategoryRow from "./CreateNewCategoryRow";
import handleCreateNewCategory from "@/lib/handleSubmit/handleCreateNewCategory";
import { set } from "mongoose";

type Props = {};

const CategoryList = (props: Props) => {
  const { data: session } = useSession();
  const { selectedBrewery, setSelectedBrewery } = useBreweryContext();

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

  const [creatingNewCategory, setCreatingNewCategory] = useState(false);

  const handleSaveNewCategory = (newCategoryName: string) => {
    if (newCategoryName.trim() === "") {
      setCreatingNewCategory(false);
      return;
    }
    if (newCategoryName && selectedBrewery) {
      const newCategoryId = handleCreateNewCategory({
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

    if (hasBeerInCheckedCategory) {
      // If any of the checked categories have beers, set the alert
      setOnlyEmptyAlert(true);
    } else {
      // If none of the checked categories have beers, handle deleting all categories
      handleDeleteAllCategories();
    }
  };

  // Call Remove or Move Beer to Category
  useEffect(() => {
    console.log("deleteConfirm changed:", deleteConfirm); // Debugging
    if (deleteConfirm) {
      handleDeleteAllCategories();
    }
  }, [deleteConfirm]);

  const handleDeleteAllCategories = () => {
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

  useEffect(() => {
    setCategories(selectedBrewery?.categories || []);
  }, [selectedBrewery]);

  useEffect(() => {
    setCategories(selectedBrewery?.categories || []);
  }, [selectedBrewery]);

  console.log({ categories });
  const anyCategoriesChecked =
    Object.values(checkedCategories).some((isChecked) => isChecked) ||
    selectAll;

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
            <th>Name</th>
            <th>Beers Under Category</th>
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
                  key={index}
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
