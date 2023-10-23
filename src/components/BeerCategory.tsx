"use client";
import { Beer } from "@/app/types/beer";
import { Brewery } from "@/app/types/brewery";
import { Category, NewCategory } from "@/app/types/category";
import { useBreweryContext } from "@/context/brewery-beer";
import { handleDeleteCategory } from "@/lib/handleSubmit/handleDeleteCategory";
import { debounce, handleBeerView, isNew } from "@/lib/utils";
import { ChevronRight, Sparkles } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import OptionsButton from "./Buttons/OptionsButton";
import ImageDisplay from "./ImageDisplay/ImageDisplay";
import BeerMugBadge from "./Badges/BeerMugBadge";
import BottomDrawer from "./Drawers/BottomDrawer";
import UpdateCategory from "./UpdateCategory/UpdateCategory";
import EditModal from "./Alerts/EditModal";
import { set } from "mongoose";

type Props = {
  category: Category | NewCategory;
  beers: Beer[] | undefined;
  isOpen: boolean;
  onClick: () => void;
  breweryId: string | undefined;
  setSelectedBrewery: (brewery: Brewery) => void;
  setBeerForDrawer: (beer: Beer) => void;
  setBottomDrawerOpen: (isOpen: boolean) => void;
};

// in BeerCategory.tsx
export default function BeerCategory({
  category,
  beers,
  isOpen,
  onClick,
  breweryId,
  setSelectedBrewery,
  setBeerForDrawer,
  setBottomDrawerOpen,
}: Props) {
  // State for managing the visibility of the options container
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const { selectedBeers, selectedBrewery } = useBreweryContext();
  // manage archived cat arrow state
  const [isArchivedOpen, setIsArchivedOpen] = useState<string | null>(null);
  const [editName, setEditName] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
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

  const beersInCategory = filteredBeers;

  // Options for the category
  const options = [
    {
      name: "Edit Name",
      onClick: () => setEditName(true),
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
                <>
                  {/* Desktop  */}
                  <Link
                    className="hidden md:flex items-center justify-between"
                    href={`/breweries/${breweryId}/beers/${beer._id}`}
                    key={beer._id}
                  >
                    <div className="inline-flex items-center">
                      <ImageDisplay
                        className="beer-category__image"
                        item={beer}
                      />

                      {beer.name}
                    </div>
                  </Link>
                  {/* Small screen bottom drawer view */}
                  <button
                    className="flex items-center justify-between md:hidden md:disabled"
                    onClick={(e) => {
                      e.stopPropagation();
                      setBeerForDrawer(beer);
                      setBottomDrawerOpen(true);
                    }}
                  >
                    <div className="inline-flex items-center">
                      <ImageDisplay
                        className="beer-category__image"
                        item={beer}
                      />

                      {beer.name}
                    </div>
                  </button>
                </>
              ))}
            </div>
          </div>
        );
      }
    );
  };

  // Check if any beer in the category is new
  const isCategoryNew = beersInCategory.some((beer) => isNew(beer));

  const handleOptions = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsOptionsOpen(!isOptionsOpen);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
    };

    const debouncedResize = debounce(handleResize, 250); // 250ms delay
    // or
    // const throttledResize = throttle(handleResize, 250); // Execute at most once every 250ms

    window.addEventListener("resize", debouncedResize);
    // or
    // window.addEventListener('resize', throttledResize);

    return () => {
      window.removeEventListener("resize", debouncedResize);
      // or
      // window.removeEventListener('resize', throttledResize);
    };
  }, []);

  return (
    <div className="relative">
      <div
        onClick={onClick}
        className={`collapse category-card  ${
          isOpen ? "collapse-open category-card__open" : ""
        } collapse-arrow my-4 `}
      >
        <div className="collapse-title category-card__title last:mr-auto">
          <p className="ml-8">{category.name}</p>
          {beersInCategory.length > 0 && (
            <BeerMugBadge beerCount={beersInCategory.length} />
          )}
          {isCategoryNew && (
            <>
              <div className="relative flex justify-center items-center">
                <p className="m-2 xxs:m-4 indicator-item badge badge-xs xs:badge-sm bg-indigo-300 text-primary ">
                  NEW
                </p>
                <Sparkles
                  size={15}
                  strokeWidth={1}
                  color="#a5b4fc"
                  className="hidden xxs:block xxs:absolute top-3 right-0"
                />
              </div>
            </>
          )}
        </div>
        <div className="collapse-content ">
          <div className="flex flex-col category-card__content">
            {category.name === "Archived"
              ? renderArchivedBeers()
              : filteredBeers.map((beer) => (
                  <>
                    {/* Small screen bottom drawer view */}
                    <button
                      className="flex items-center justify-between md:hidden md:disabled"
                      onClick={(e) => {
                        e.stopPropagation();
                        setBeerForDrawer(beer);
                        setBottomDrawerOpen(true);
                        handleBeerView(beer._id);
                      }}
                    >
                      <div className="inline-flex items-center">
                        <ImageDisplay
                          className="beer-category__image"
                          item={beer}
                        />

                        <p className="beer-category__name">{beer.name}</p>
                      </div>
                      <div className="inline-flex justify-center items-center ">
                        {isNew(beer) && (
                          <Sparkles size={18} strokeWidth={1} color="#a5b4fc" />
                        )}

                        <ChevronRight size={24} strokeWidth={1} />
                      </div>
                    </button>
                    {/* Desktop modal page  */}
                    <Link
                      className="hidden md:flex items-center justify-between"
                      href={`/breweries/${breweryId}/beers/${beer._id}`}
                      key={beer._id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBeerView(beer._id);
                      }}
                    >
                      <div className="inline-flex items-center">
                        <ImageDisplay
                          className="beer-category__image"
                          item={beer}
                        />

                        <p className="beer-category__name">{beer.name}</p>
                      </div>
                      <div className="inline-flex justify-center items-center ">
                        {isNew(beer) && (
                          <Sparkles size={18} strokeWidth={1} color="#a5b4fc" />
                        )}

                        <ChevronRight size={24} strokeWidth={1} />
                      </div>
                    </Link>
                  </>
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

      {isMobile ? (
        <BottomDrawer isOpen={editName}>
          <UpdateCategory
            category={category as Category}
            onClose={() => setEditName(false)}
          />
        </BottomDrawer>
      ) : (
        <EditModal isOpen={editName} title="Edit Category Name">
          <UpdateCategory
            category={category as Category}
            onClose={() => setEditName(false)}
          />
        </EditModal>
      )}
    </div>
  );
}
