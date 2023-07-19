"use server";
import { Brewery } from "@/app/types/brewery";
import { FormValues } from "@/components/CreateBeerForm/types";
import updateBeer from "../PUT/updateBeer";
import createCategory from "../createCategory";
import getSingleBrewery from "../getSingleBrewery";
import { revalidatePath } from "next/cache";

// Handle form submission
const handleUpdateBeer = async (
  values: FormValues,
  breweryId: string,
  accessToken: string
) => {
  let brewery: Brewery;
  if (!breweryId) {
    const savedBrewery = sessionStorage.getItem("selectedBreweryId");
    const getBrewery = await getSingleBrewery(
      JSON.parse(savedBrewery),
      accessToken
    );
    brewery = getBrewery;
  }
  brewery = await getSingleBrewery(breweryId, accessToken);

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

    // Map categories to their IDs
    const categoryIds = await Promise.all(
      values.category.map((category) => getCategoryId(category.value))
    );

    const updatedBeer = {
      ...values,
      hops: values.hops.map((hop) => hop.name),
      malt: values.malt.map((malt) => malt.name),
      category: categoryIds,
    };

    const updatedBeerRes = await updateBeer({
      updatedBeer,
      breweryId: brewery._id,
      accessToken,
    });

    if (updatedBeerRes) revalidatePath(`/breweries/[breweryId]`);

    return updatedBeerRes;
  } catch (error) {
    console.error(error);
  }
};
export default handleUpdateBeer;
