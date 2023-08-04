"use client";
import { Brewery } from "@/app/types/brewery";
import { Category } from "@/app/types/category";
import { useBreweryContext } from "@/context/brewery-beer";
import getBreweryBeers from "@/lib/getBreweryBeers";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import BeerCategory from "./BeerCategory";
import getSingleBrewery from "@/lib/getSingleBrewery";
import { set } from "mongoose";
import BreweryProfileSkeleton from "./LoadingSkeleton/BreweryProfileLS";

type pageProps = {
  breweryId: string;
};

export default function BreweryProfiles({ breweryId }: pageProps) {
  const { data: session } = useSession();

  const { data: beers, error: beersError } = useSWR(
    [
      `https://beer-bible-api.vercel.app/breweries/${breweryId}/beers`,
      session?.user.accessToken,
    ],
    getBreweryBeers
  );

  const { data: brewery, error: breweryError } = useSWR(
    [
      `https://beer-bible-api.vercel.app/breweries/${breweryId}`,
      session?.user.accessToken,
    ],
    getSingleBrewery
  );
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

  useEffect(() => {
    setSelectedBrewery(brewery);
    setSelectedBeers(beers);
    setCategories(brewery?.categories);
  }, [beers, brewery]);

  // watch for change in selected brewery and beer to update categories
  useEffect(() => {
    setCategories(selectedBrewery?.categories || []);
  }, [selectedBrewery, selectedBeers]);

  console.log({ brewery, beers, session });
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
    beers && (
      <section className="w-1/2 m-auto">
        <Suspense fallback={<BreweryProfileSkeleton />}>
          <h1>{selectedBrewery?.companyName}</h1>

          <div>
            {beersForCategory &&
              beers &&
              beersForCategory.map((beers, i) => {
                return beers?.length > 0 ? (
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

          <div className="w-full h-full flex justify-center">
            <Link
              href={`/create/${selectedBrewery?._id}/beer`}
              className="btn btn-accent"
            >
              Create A Beer
            </Link>
          </div>
        </Suspense>
      </section>
    )
  );
}
