"use client";
import { Beer } from "@/app/types/beer";
import { Brewery } from "@/app/types/brewery";
import { Category, NewCategory } from "@/app/types/category";
import { useBreweryContext } from "@/context/brewery-beer";
import { handleDeleteCategory } from "@/lib/handleSubmit/handleDeleteCategory";
import { handleBeerView, isNew } from "@/lib/utils";
import { ChevronRight, Sparkles } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useMemo, useState } from "react";
import OptionsButton from "./Buttons/OptionsButton";
import ImageDisplay from "./ImageDisplay/ImageDisplay";
import BeerMugBadge from "./Badges/BeerMugBadge";

type Props = {
  category: Category | NewCategory;
  beers: Beer[] | undefined;
  isOpen: boolean;
  onClick: () => void;
  breweryId: string | undefined;
  setSelectedBrewery: (brewery: Brewery) => void;
};

// in BeerCategory.tsx
export default function BeerCategory({
  category,
  beers,
  isOpen,
  onClick,
  breweryId,
  setSelectedBrewery,
}: Props) {
  // State for managing the visibility of the options container
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const { selectedBeers, selectedBrewery } = useBreweryContext();
  // manage archived cat arrow state
  const [isArchivedOpen, setIsArchivedOpen] = useState<string | null>(null);
  const { data: session } = useSession();

  const filteredBeers = useMemo(() => {
    if (!beers) return [];
    if (category.name === "All Beers") {
      return beers;
    }
    if (category.name === "Archived") {
      return beers.filter((beer) => beer.archived);
    }
    return beers.filter((beer) =>
      beer.category
        ? beer.category.some((cat) => cat.name === category.name) &&
          !beer.archived
        : false
    );
  }, [beers, category.name]);

  // This assumes each beer belongs to exactly one category.
  const groupBeersByCategory = (beers: Beer[]) => {
    const groupedBeers: { [key: string]: Beer[] } = {};

    for (let beer of beers) {
      for (let category of beer.category) {
        if (category.name !== "Archived") {
          if (groupedBeers[category.name]) {
            groupedBeers[category.name].push(beer);
          } else {
            groupedBeers[category.name] = [beer];
          }
        }
      }
    }

    return groupedBeers;
  };

  // const renderAllBeers = (beers: Beer[]) => {
  //   const groupedBeers = groupBeersByCategory(beers);

  //   return Object.entries(groupedBeers).map(
  //     ([categoryName, beersInCategory]) => {
  //       // Check if any beer in the category is new

  //       return (
  //         <div
  //           key={categoryName}
  //           className={`collapse collapse-arrow  bg-base-200`}
  //         >
  //           <input type="checkbox" />
  //           <div className="collapse-title text-xl font-medium">
  //             <p>{category.name}</p>
  //           </div>
  //           <div className="collapse-content">
  //             {beersInCategory.map((beer) => (
  //               <Link
  //                 href={`/breweries/${breweryId}/beers/${beer._id}`}
  //                 key={beer._id}
  //               >
  //                 {beer.name}
  //               </Link>
  //             ))}
  //           </div>
  //         </div>
  //       );
  //     }
  //   );
  // };

  const renderArchivedBeers = () => {
    if (!beers) return null;
    const archivedBeers = beers.filter((beer) => beer.archived);
    const groupedBeers = groupBeersByCategory(archivedBeers);

    return Object.entries(groupedBeers).map(
      ([categoryName, beersInCategory]) => {
        const isOpen = categoryName === isArchivedOpen;

        return (
          <div
            key={categoryName}
            className={`collapse category-card ${
              isOpen ? "collapse-open" : ""
            } bg-base-200 `}
            onClick={(e) => {
              setIsArchivedOpen(isOpen ? null : categoryName),
                e.stopPropagation();
            }}
          >
            <div
              className={`collapse-title category-card__title ${
                isOpen ? "after:text-primary" : ""
              }`}
            >
              <p>{categoryName}</p>
            </div>
            <div className="collapse-content category-card__content pb-0">
              {beersInCategory.map((beer) => (
                <Link
                  className="flex items-center justify-between"
                  href={`/breweries/${breweryId}/beers/${beer._id}`}
                  key={beer._id}
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
                </Link>
              ))}
            </div>
          </div>
        );
      }
    );
  };

  const beersInCategory = filteredBeers;

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
      onClick: async () => {
        const updateBrewCats = await handleDeleteCategory({
          categoryId: category._id as any,
          breweryId: breweryId as any,
          selectedBeers: selectedBeers as any,
          selectedBrewery: selectedBrewery as any,
          token: session?.user?.accessToken as any,
        });

        if (updateBrewCats) setSelectedBrewery(updateBrewCats as Brewery);
      },

      disabled: beersInCategory.length > 0, // Disable this option if there are beers in the category
    },
  ];
  return (
    <div className="relative">
      <div
        onClick={onClick}
        className={`collapse category-card  ${
          isOpen ? "collapse-open category-card__open" : ""
        } collapse-arrow my-4 `}
      >
        <div className="collapse-title category-card__title">
          <p className="ml-8">{category.name}</p>
          {beersInCategory.length > 0 && (
            <BeerMugBadge beerCount={beersInCategory.length} />
          )}
          {isCategoryNew && <p className="tag-new">NEW</p>}
        </div>
        <div className="collapse-content ">
          <div className="flex flex-col category-card__content">
            {category.name === "Archived"
              ? renderArchivedBeers()
              : filteredBeers.map((beer) => (
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
                    <div className="inline-flex justify-center items-center ">
                      {isNew(beer) && (
                        <>
                          <div className=" relative ">
                            <p className="hidden md:block md:indicator-item md:badge md:bg-indigo-300  ">
                              NEW
                            </p>
                            <Sparkles
                              size={20}
                              strokeWidth={1}
                              color="#a5b4fc"
                              className="md:absolute md:top-2 md:right-0"
                            />
                          </div>
                        </>
                      )}

                      <ChevronRight size={24} strokeWidth={1} />
                    </div>
                  </Link>
                ))}
          </div>
        </div>
      </div>

      {category.name !== "Archived" && (
        <OptionsButton
          handleOptions={handleOptions}
          className="btn btn-circle btn-ghost"
          options={options}
        />
      )}
    </div>
  );
}
