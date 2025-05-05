import { Brewery } from "@/types/brewery";
import { FormValues } from "@/components/CreateBeerForm/types";
import updateBeer from "../PUT/updateBeer";
import createCategory from "../createCategory";
import getSingleBrewery from "../getSingleBrewery";
import { revalidatePath } from "next/cache";
import updateBeerCategory from "../PUT/updateBeerCategory";

type Props = {
  values: FormValues | any;
  beerId: string | null;
  brewery: Brewery | null;
  accessToken: string | undefined;
  updatedCategory: string[];
};
// Handle form submission
const handleMoveBeerToCategory = async ({
  values,
  beerId,
  brewery,
  accessToken,
  updatedCategory,
}: Props) => {
  try {
    // Function to get category ID, creating a new category if necessary

    // Converting brewery categories to a Map for O(1) lookup times
    const existingCategories = new Map(
      brewery?.categories.map((cat) => [cat.name, cat._id])
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
          breweryId: brewery?._id,
        });
        if (!createdCategory._id) {
          throw new Error(`Category creation failed for: ${categoryName}`);
        }
        return createdCategory._id;
      }
    };

    // Map categories to their IDs
    const categoryIds = await Promise.all(
      values.category.map((category: any) => getCategoryId(category.value))
    );

    const newCategoryIds = [...categoryIds, ...updatedCategory];

    const updatedBeerRes = await updateBeerCategory({
      beerId,
      updatedCategory: newCategoryIds,
      breweryId: brewery?._id,
      accessToken,
    });

    return updatedBeerRes;
  } catch (error) {
    console.error(error);
  }
};
export default handleMoveBeerToCategory;
