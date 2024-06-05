"use client";
import { Beer } from "@/app/types/beer";
import { Brewery } from "@/app/types/brewery";
import { Category } from "@/app/types/category";
import React from "react";
import deleteCategory from "../DELETE/deleteCategory";
import { revalidatePath } from "next/cache";

type Props = {
  categoryId: string | Category;
  breweryId: string;

  selectedBrewery: Brewery;

  selectedBeers: Beer[];
  token: string;
};

export const handleDeleteCategory = async ({
  categoryId,
  breweryId,

  selectedBrewery,

  selectedBeers,
  token,
}: Props) => {
  try {
    // Check if any beer in the selected beers state array has the category id to be deleted
    const associatedBeers = selectedBeers?.filter((beer) =>
      beer.category.some((cat) => cat._id === categoryId)
    );
    if (associatedBeers && associatedBeers.length > 0) {
      alert(
        `There are beers under with this category.
        Please recategorize them before deleting category.`
      );
      throw new Error(
        "There are beers associated with this category. Please recategorize beers before deleting category."
      );
    }

    // Use confirm() to get user confirmation before deleting
    const confirmDelete = confirm(
      "Are you sure you want to delete this category?"
    );

    // If the user clicks Cancel (i.e., confirmDelete is false), stop the function
    if (!confirmDelete) {
      return;
    }

    // If no beer has the category, delete the category
    const deletedCategory = await deleteCategory({
      breweryId,
      categoryId: categoryId as string,
      token,
    });

    // Update the brewery state by filtering out the category to be deleted
    if (deletedCategory && selectedBrewery) {
      const updatedBrewery = {
        ...selectedBrewery,
        categories: selectedBrewery.categories.filter(
          (cat) => cat._id !== categoryId
        ),
      };

      alert(deletedCategory.message);

      return updatedBrewery;
    }
  } catch (err) {
    console.error(err);
  }
};
