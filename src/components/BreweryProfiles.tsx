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
      <section className="md:w-1/2 mt-10 mx-auto py-3">
        <Suspense fallback={<BreweryProfileSkeleton />}>
          <h3>Home</h3>

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
          </div>

          <div className="fixed right-5 bottom-20 lg:static flex justify-center lg:w-full gap-2 items-center p-1">
            <Link
              href={`/create/${selectedBrewery?._id}/beer`}
              className="btn btn-circle create-btn !btn-lg"
            >
              <Plus size={30} />
            </Link>
            <p className="hidden m-0 text-lg lg:flex">Beer</p>
          </div>
        </Suspense>
      </section>
    )
  );
}
