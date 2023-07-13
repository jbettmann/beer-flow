"use client";
import { Beer } from "@/app/types/beer";
import { Brewery } from "@/app/types/brewery";
import BeerCategory from "./BeerCategory";
import { Category } from "@/app/types/category";
import { notFound, redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { compareSync } from "bcrypt";

type Props = {
  promise: [Brewery, Beer[]];
};

export default function BreweryProfiles({ promise }: Props) {
  const [brewery, beers] = promise;
  const { data: session, update } = useSession();
  console.log(session?.user);

  const categories = [...brewery?.categories];

  // check for previous open category to prises open state
  const [openCategory, setOpenCategory] = useState<string | null | number>(
    null
  );
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedBreweryId", brewery._id);
      const storedOpenCategory = sessionStorage.getItem("openCategory");
      setOpenCategory(storedOpenCategory);
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

  const content = (
    <section className="w-1/2 m-auto">
      <h1>{brewery.companyName}</h1>
      {brewery.categories.length > 1 && (
        <div>
          {categories.map((category, i) => (
            <BeerCategory
              key={i}
              category={category}
              beers={beers}
              onClick={() => handleCategoryClick(i)}
              isOpen={openCategory == i}
            />
          ))}
          <div className="mt-10">
            {/* <BeerCategory
            key="all"
            category={{ name: "All Beers" }}
            beers={beers}
            onClick={() => handleCategoryClick("all")}
            isOpen={openCategory === "all"}
          /> */}

            <BeerCategory
              key="archived"
              category={{ name: "Archived" }}
              beers={beers}
              onClick={() => handleCategoryClick("archived")}
              isOpen={openCategory == "archived"}
            />
          </div>
        </div>
      )}
      <div className="w-full h-full flex justify-center">
        <Link href={`/create/${brewery._id}/beer`} className="btn btn-accent">
          Create A Beer
        </Link>
      </div>
    </section>
  );

  return content;
}
