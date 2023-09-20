"use client";
import { Beer } from "@/app/types/beer";
import { Category } from "@/app/types/category";
import updateCategory from "../PUT/updateCategory";

type Props = {
  categoryId: string;
  updatedCategory: Category;
  accessToken: string | undefined;
  setBreweryState: {
    selectedBeers: any;
    selectedBrewery: any;
    setSelectedBeers: any;
    setSelectedBrewery: any;
  };
};

const handleUpdateCategory = async ({
  updatedCategory,
  categoryId,
  accessToken,
  setBreweryState,
}: Props) => {
  const updatedCatRes = await updateCategory({
    updatedCategory,
    categoryId,
    accessToken,
  });

  //  update brewery with new category
  if (updatedCatRes && setBreweryState.selectedBrewery) {
    const updatedBrewery = { ...setBreweryState.selectedBrewery };
    const catIndex = updatedBrewery.categories.findIndex(
      (b: any) => b._id === updatedCategory._id
    );
    updatedBrewery.categories[catIndex] = updatedCatRes;

    console.log({ updatedCatRes, updatedCategory, updatedBrewery });

    setBreweryState.setSelectedBrewery(updatedBrewery);
  }

  //  update beers with new category
  if (updatedCatRes && setBreweryState.selectedBeers) {
    const updatedBeers = setBreweryState.selectedBeers.map((beer: Beer) => {
      const updatedCategories = beer.category.map((cat) => {
        if (cat._id === updatedCatRes._id) {
          return updatedCatRes; // Replace the category with the updated one
        }
        return cat; // If not this category, return the category as is
      });

      return {
        ...beer,
        category: updatedCategories, // Assign the updated categories back to the beer
      };
    });

    setBreweryState.setSelectedBeers(updatedBeers);
  }

  return updatedCatRes;
};

export default handleUpdateCategory;
