"use client";
import { Category } from "@/app/types/category";
import { useBreweryContext } from "@/context/brewery-beer";
import { Beer as BeerIcon, Plus } from "lucide-react";
import Link from "next/link";
import { Suspense, use, useEffect, useMemo, useState } from "react";
import BeerCategory from "./BeerCategory";
import BreweryProfileSkeleton from "./LoadingSkeleton/BreweryProfileLS";
import { Beer } from "@/app/types/beer";
import BottomDrawer from "./Drawers/BottomDrawer";
import BeerCard from "./BeerCard";
import CreateBeerForm from "./CreateBeerForm/CreateBeerForm";
import EditModal from "./Alerts/EditModal";
import { debounce } from "@/lib/utils";
import CreateModal from "./Alerts/CreateModal";

type pageProps = {
  breweryId: string;
};

export default function BreweryProfiles({ breweryId }: pageProps) {
  const {
    setSelectedBrewery,
    setSelectedBeers,
    selectedBrewery,
    selectedBeers,
    beersLoading,
    breweryLoading,
    isAdmin,
  } = useBreweryContext();

  // check for previous open category to prises open state
  const [openCategory, setOpenCategory] = useState<string | null | number>(
    null
  );
  const [categories, setCategories] = useState<Category[]>([]);
  // Mobile Beer Card View
  const [bottomDrawerOpen, setBottomDrawerOpen] = useState<boolean>(false);
  const [beerForDrawer, setBeerForDrawer] = useState<Beer | null>(null);
  // Mobile Create Beer View
  const [isCreateBeer, setIsCreateBeer] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const beersForCategory = useMemo(() => {
    return categories?.map((category, i) => {
      return selectedBeers?.filter((beer) =>
        beer.category
          ? beer?.category.some((cat) => cat.name === category.name) &&
            !beer.archived
          : false
      );
    });
  }, [selectedBeers, selectedBrewery, categories]);

  // Handle category change
  const handleCategoryClick = (categoryKey: any) => {
    if (typeof window !== "undefined") {
      if (categoryKey === openCategory) {
        sessionStorage.removeItem("openCategory");
        setOpenCategory(null);
      } else {
        sessionStorage.setItem("openCategory", categoryKey);
        setOpenCategory(categoryKey);
      }
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleResize = () => {
        setIsMobile(window.innerWidth <= 768);
      };

      const debouncedResize = debounce(handleResize, 250); // 250ms delay

      window.addEventListener("resize", debouncedResize);

      return () => {
        window.removeEventListener("resize", debouncedResize);
      };
    }
  }, []);

  // watch for change in selected brewery and beer to update categories
  useEffect(() => {
    setCategories((selectedBrewery?.categories as Category[]) || []);
  }, [selectedBrewery, selectedBeers]);

  // console.log({ brewery, beers, session });
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedOpenCategory = sessionStorage.getItem("openCategory");
      setOpenCategory(storedOpenCategory);
    }

    // if (typeof window !== "undefined" && selectedBrewery) {
    //   localStorage.setItem("selectedBreweryId", selectedBrewery._id);
    // }
  }, [selectedBrewery?._id]);

  if (breweryLoading || beersLoading) return <BreweryProfileSkeleton />;

  return (
    selectedBeers && (
      <section className="sm:w-3/4 md:w-1/2 lg:w-[40%] xl:w-1/3 mt-8 mx-auto py-3 md:mt-0 md:p-8">
        <Suspense fallback={<BreweryProfileSkeleton />}>
          <div className="flex justify-center md:p-5">
            <h3 className="text-center lg:text-left">Home</h3>
          </div>

          <div>
            {beersForCategory &&
              selectedBeers &&
              beersForCategory.map((beers, i) => {
                return beers && beers.length > 0 ? (
                  <BeerCategory
                    key={categories[i]._id}
                    category={categories[i]}
                    beers={beers}
                    onClick={() => handleCategoryClick(i)}
                    isOpen={openCategory == i}
                    breweryId={selectedBrewery?._id}
                    setSelectedBrewery={setSelectedBrewery}
                    setBeerForDrawer={setBeerForDrawer}
                    setBottomDrawerOpen={setBottomDrawerOpen}
                  />
                ) : null;
              })}

            <div className="mt-10">
              <BeerCategory
                key="archived"
                category={{ name: "Archived" }}
                beers={selectedBeers}
                onClick={() => handleCategoryClick("archived")}
                isOpen={openCategory == "archived"}
                breweryId={selectedBrewery?._id}
                setSelectedBrewery={setSelectedBrewery}
                setBeerForDrawer={setBeerForDrawer}
                setBottomDrawerOpen={setBottomDrawerOpen}
              />
            </div>
            {/* Create Beer button for Admins */}
            {isAdmin && (
              <>
                <div className="hidden lg:flex mt-10 justify-center">
                  <button
                    onClick={() => setIsCreateBeer(true)}
                    className="create-btn "
                  >
                    <span className="flex justify-center items-center">
                      + Beer
                    </span>
                    <BeerIcon size={20} />
                  </button>
                </div>
                {/* Small Screen New Category Button */}
                <div className="fixed right-5 bottom-10 p-1 z-[2] lg:hidden ">
                  <button
                    onClick={() => setIsCreateBeer(true)}
                    className="btn btn-circle btn-white create-btn !btn-lg"
                  >
                    <Plus size={28} />
                  </button>
                </div>
              </>
            )}
          </div>
        </Suspense>
        {/* Beer Card View for Mobile */}
        <BottomDrawer isOpen={bottomDrawerOpen}>
          {/* @ts-expect-error Server component */}
          <BeerCard
            beerForDrawer={beerForDrawer as Beer}
            onClose={() => {
              setBottomDrawerOpen(false);
              setTimeout(() => {
                setBeerForDrawer(null);
              }, 500);
            }}
          />
        </BottomDrawer>
        {/* Create Beer for Mobile */}
        {isAdmin &&
          (isMobile ? (
            <BottomDrawer isOpen={isCreateBeer}>
              <CreateBeerForm setIsCreateBeer={setIsCreateBeer} />
            </BottomDrawer>
          ) : (
            <CreateModal isOpen={isCreateBeer}>
              <CreateBeerForm setIsCreateBeer={setIsCreateBeer} />
            </CreateModal>
          ))}
      </section>
    )
  );
}
