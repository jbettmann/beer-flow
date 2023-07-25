"use client";
import { useBreweryContext } from "@/context/brewery-beer";
import { getSession, useSession } from "next-auth/react";
import React from "react";
import deleteCategory from "../DELETE/deleteCategory";
import { set } from "mongoose";
import { Category } from "@/app/types/category";
import { Brewery } from "@/app/types/brewery";
import { Beer } from "@/app/types/beer";

type Props = {
  categoryId: string | Category;
  breweryId: string;
  setIsOptionsOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  selectedBrewery: Brewery;
  setSelectedBrewery: React.Dispatch<React.SetStateAction<Brewery>>;
  selectedBeers: Beer[];
  token: string;
};

export const handleDeleteCategory = async ({
  categoryId,
  breweryId,
  setIsOptionsOpen,
  selectedBrewery,
  setSelectedBrewery,
  selectedBeers,
  token,
}: Props) => {
  try {
    // Check if any beer in the selected beers state array has the category id to be deleted
    const associatedBeers = selectedBeers?.filter((beer) =>
      beer.category.some((cat) => cat._id === categoryId)
    );
    if (associatedBeers && associatedBeers.length > 0) {
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

    console.log({ categoryId, breweryId, token });
    // If no beer has the category, delete the category
    const deletedCategory = await deleteCategory({
      breweryId,
      categoryId,
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
      console.log({ updatedBrewery, deletedCategory });
      setSelectedBrewery(updatedBrewery);
    }

    if (deletedCategory) {
      alert(deletedCategory.message);
    }
  } catch (err) {
    console.error(err);
  } finally {
    setIsOptionsOpen && setIsOptionsOpen(false);
  }
};
