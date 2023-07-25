"use client";
import { Brewery } from "@/app/types/brewery";
import { Category } from "@/app/types/category";
import { useBreweryContext } from "@/context/brewery-beer";
import getBreweryBeers from "@/lib/getBreweryBeers";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import useSWR from "swr";
import BeerCategory from "./BeerCategory";

type pageProps = {
  promise: [Brewery];
  breweryId: string;
};

export default function BreweryProfiles({ promise, breweryId }: pageProps) {
  const [brewery] = promise;

  const { data: session } = useSession();
  const { data: beers, error: beersError } = useSWR(
    [
      `https://beer-bible-api.vercel.app/breweries/${breweryId}/beers`,
      session?.user.accessToken,
    ],
    getBreweryBeers
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

  let categories: Category[] = [...brewery?.categories];

  useEffect(() => {
    setSelectedBrewery(brewery);
    setSelectedBeers(beers);
  }, [beers, brewery]);

  console.log({ brewery, beers });
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedOpenCategory = sessionStorage.getItem("openCategory");
      setOpenCategory(storedOpenCategory);
    }

    if (typeof window !== "undefined" && selectedBrewery) {
      localStorage.setItem("selectedBreweryId", selectedBrewery._id);
    }
  }, []);

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

  return (
    <section className="w-1/2 m-auto">
      <h1>{selectedBrewery?.companyName}</h1>

      <div>
        <Suspense
          fallback={
            <span className="loading loading-spinner loading-lg"></span>
          }
        >
          {brewery.categories.length > 0 &&
            categories.map((category, i) => (
              <BeerCategory
                key={i}
                category={category}
                beers={selectedBeers}
                onClick={() => handleCategoryClick(i)}
                isOpen={openCategory == i}
                breweryId={selectedBrewery?._id}
              />
            ))}
          <div className="mt-10">
            <BeerCategory
              key="archived"
              category={{ name: "Archived" }}
              beers={selectedBeers}
              onClick={() => handleCategoryClick("archived")}
              isOpen={openCategory == "archived"}
              breweryId={selectedBrewery?._id}
            />
          </div>
        </Suspense>
      </div>

      <div className="w-full h-full flex justify-center">
        <Link
          href={`/create/${selectedBrewery?._id}/beer`}
          className="btn btn-accent"
        >
          Create A Beer
        </Link>
      </div>
    </section>
  );
}
