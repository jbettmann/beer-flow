import { Brewery } from "@/app/types/brewery";

import { FormValues } from "@/components/CreateBeerForm/types";
import createCategory from "../createCategory";
import createBeer from "@/lib/createBeer";
import getSingleBrewery from "../getSingleBrewery";
import saveImage from "../supabase/saveImage";

// Handle form submission
const handleCreateBeer = async (
  values: FormValues,
  brewery: Brewery,
  accessToken: string
) => {
  if (!brewery) {
    const savedBrewery = sessionStorage.getItem("selectedBreweryId");
    const getBrewery = await getSingleBrewery(JSON.parse(savedBrewery));
    brewery = getBrewery;
  }
  try {
    // Save the image to the database and create link
    const beerImage = values.image
      ? await saveImage({ file: values.image })
      : undefined;

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

    const newBeer = {
      ...values,
      hops: values.hops.map((hop) => hop.name),
      malt: values.malt.map((malt) => malt.name),
      category: categoryIds,
      image: beerImage,
    };

    const newBeerRes = await createBeer({
      newBeer,
      breweryId: brewery._id,
      accessToken,
    });

    return newBeerRes;
  } catch (error) {
    console.error(error);
  }
};
export default handleCreateBeer;
