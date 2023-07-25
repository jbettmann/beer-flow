"use client";
import { Beer } from "@/app/types/beer";
import { Category } from "@/app/types/category";
import Link from "next/link";
import ImageDisplay from "./ImageDisplay/ImageDisplay";
import { handleBeerView, isNew } from "@/lib/utils";
import OptionsButton from "./Buttons/OptionsButton";
import { useState } from "react";
import { handleDeleteCategory } from "@/lib/handleSubmit/handleDeleteCategory";
import { useBreweryContext } from "@/context/brewery-beer";
import { useSession } from "next-auth/react";

type Props = {
  category: Category;
  beers: Beer[];
  isOpen: boolean;
  onClick: () => void;
  breweryId: string;
};

// in BeerCategory.tsx
export default function BeerCategory({
  category,
  beers,
  isOpen,
  onClick,
  breweryId,
}: Props) {
  // State for managing the visibility of the options container
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const { selectedBeers, selectedBrewery, setSelectedBrewery } =
    useBreweryContext();

  const { data: session } = useSession();

  const filteredBeers = () => {
    if (!beers) return [];
    if (category.name === "All Beers") {
      return beers;
    }
    if (category.name === "Archived") {
      return beers.filter((beer) => beer.archived);
    }
    return beers.filter((beer) =>
      beer.category
        ? beer.category.some((cat) => cat.name === category.name)
        : false
    );
  };

  // This assumes each beer belongs to exactly one category.
  const groupBeersByCategory = (beers: Beer[]) => {
    const groupedBeers: { [key: string]: Beer[] } = {};

    for (let beer of beers) {
      const categoryName = beer.category[0].name;

      if (groupedBeers[categoryName]) {
        groupedBeers[categoryName].push(beer);
      } else {
        groupedBeers[categoryName] = [beer];
      }
    }

    return groupedBeers;
  };

  const renderAllBeers = (beers: Beer[]) => {
    const groupedBeers = groupBeersByCategory(beers);

    return Object.entries(groupedBeers).map(
      ([categoryName, beersInCategory]) => {
        // Check if any beer in the category is new

        return (
          <div
            key={categoryName}
            className={`collapse collapse-arrow  bg-base-200`}
          >
            <input type="checkbox" />
            <div className="collapse-title text-xl font-medium">
              <p>{category.name}</p>
            </div>
            <div className="collapse-content">
              {beersInCategory.map((beer) => (
                <Link
                  href={`/breweries/${breweryId}/beers/${beer._id}`}
                  key={beer._id}
                >
                  {beer.name}
                </Link>
              ))}
            </div>
          </div>
        );
      }
    );
  };

  const renderArchivedBeers = () => {
    if (!beers) return null;
    const archivedBeers = beers.filter((beer) => beer.archived);
    return renderAllBeers(archivedBeers);
  };

  const beersInCategory = filteredBeers();

  // Check if any beer in the category is new
  const isCategoryNew = beersInCategory.some((beer) => isNew(beer));

  const handleOptions = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsOptionsOpen(!isOptionsOpen);
  };

  // Options for the category
  const options = [
    {
      name: "Edit Category",
      href: `/breweries/${breweryId}/categories/${category._id}`,
      disabled: false,
    },
    {
      name: "Delete Category",
      onClick: () =>
        handleDeleteCategory({
          categoryId: category._id,
          breweryId,
          selectedBeers,
          selectedBrewery,
          setSelectedBrewery,
          token: session?.user?.accessToken,
        }),
      disabled: beersInCategory.length > 0, // Disable this option if there are beers in the category
    },
  ];
  return (
    <div className="relative">
      <div
        onClick={onClick}
        className={`collapse  ${
          isOpen ? "collapse-open" : ""
        } collapse-arrow my-8  bg-base-200`}
      >
        <div className="collapse-title text-xl font-medium inline-flex justify-between ">
          <p>{category.name}</p>
          {isCategoryNew && <p className="tag-new">NEW</p>}
        </div>
        <div className="collapse-content">
          <div className="flex flex-col">
            {category.name === "Archived"
              ? renderArchivedBeers()
              : filteredBeers().map((beer) => (
                  <Link
                    className="flex items-center justify-between"
                    href={`/breweries/${breweryId}/beers/${beer._id}`}
                    key={beer._id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBeerView(beer._id);
                    }}
                  >
                    <div className="inline-flex items-center">
                      {beer.image && (
                        <ImageDisplay
                          className="beer-category__image"
                          item={beer}
                        />
                      )}
                      {beer.name}
                    </div>
                    {isNew(beer) && <p className="tag-new">NEW</p>}
                  </Link>
                ))}
          </div>
        </div>
      </div>

      <OptionsButton
        handleOptions={(e) => handleOptions(e)}
        className="btn btn-circle btn-ghost"
        options={options}
      />
    </div>
  );
}
