import { Brewery } from "@/app/types/brewery";
import React from "react";
import createCategory from "../createCategory";

type Props = {
  categoryName: string;
  brewery: Brewery;
  accessToken: string;
};

const handleCreateNewCategory = async ({
  categoryName,
  brewery,
  accessToken,
}: Props) => {
  try {
    // Converting brewery categories to a Map for O(1) lookup times
    const existingCategories = new Map(
      brewery.categories.map((cat) => [cat.name, cat._id])
    );

    // Function to get category ID, creating a new category if necessary
    const getCategoryId = async (categoryName: string): Promise<string> => {
      if (existingCategories.has(categoryName)) {
        const existingId = existingCategories.get(categoryName);
        if (!existingId) {
          throw new Error(
            `ID not found for existing category: ${categoryName}`
          );
        }
        return existingId;
      } else {
        const newCategory = { name: categoryName };
        const createdCategory = await createCategory({
          newCategory,
          breweryId: brewery._id,
          accessToken,
        });
        if (!createdCategory._id) {
          throw new Error(`Category creation failed for: ${categoryName}`);
        }
        return createdCategory._id;
      }
    };
    return await getCategoryId(categoryName);
  } catch (error) {
    console.error(error);
  }
};

export default handleCreateNewCategory;
