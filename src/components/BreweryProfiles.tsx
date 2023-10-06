"use client";
import { Category } from "@/app/types/category";
import { useBreweryContext } from "@/context/brewery-beer";
import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import BeerCategory from "./BeerCategory";
import BreweryProfileSkeleton from "./LoadingSkeleton/BreweryProfileLS";
import { Beer, Plus } from "lucide-react";

type pageProps = {
  breweryId: string;
};

export default function BreweryProfiles({ breweryId }: pageProps) {
  const {
    setSelectedBrewery,
    setSelectedBeers,
    selectedBrewery,
    selectedBeers,
  } = useBreweryContext();

  // check for previous open category to prises open state
  const [openCategory, setOpenCategory] = useState<string | null | number>(
    null
  );

  const [categories, setCategories] = useState<Category[]>([]);

  // let categories: Category[] = [...brewery?.categories];

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

    if (typeof window !== "undefined" && selectedBrewery) {
      localStorage.setItem("selectedBreweryId", selectedBrewery._id);
    }
  }, [selectedBrewery?._id]);

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

  return (
    selectedBeers && (
      <section className="sm:w-3/4 md:w-1/2 lg:w-[40%] xl:w-1/3 mt-8 mx-auto py-3 md:mt-0 md:p-8">
        <Suspense fallback={<BreweryProfileSkeleton />}>
          <div className="flex justify-center md:p-5">
            <h3 className="text-center lg:text-left">Home</h3>
          </div>
          {/* Small Screen New Category Button */}
          <div className="fixed right-5 bottom-20 p-1 z-[2] lg:hidden ">
            <Link
              href={`/create/${selectedBrewery?._id}/beer`}
              className="btn btn-circle btn-white create-btn !btn-lg"
            >
              <Plus size={28} />
            </Link>
          </div>

          <div>
            {beersForCategory &&
              selectedBeers &&
              beersForCategory.map((beers, i) => {
                return beers && beers.length > 0 ? (
                  <BeerCategory
                    key={i}
                    category={categories[i]}
                    beers={beers}
                    onClick={() => handleCategoryClick(i)}
                    isOpen={openCategory == i}
                    breweryId={selectedBrewery?._id}
                    setSelectedBrewery={setSelectedBrewery}
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
              />
            </div>
            <div className="hidden lg:flex mt-10 justify-center">
              <Link
                href={`/create/${selectedBrewery?._id}/beer`}
                className="create-btn "
              >
                <span className="flex justify-center items-center">+ Beer</span>
                <Beer size={20} />
              </Link>
            </div>
          </div>
        </Suspense>
      </section>
    )
  );
}
