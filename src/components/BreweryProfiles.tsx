"use client";
import { Beer } from "@/app/types/beer";
import { Brewery } from "@/app/types/brewery";
import BeerCategory from "./BeerCategory";
import { Category } from "@/app/types/category";
import { notFound, redirect } from "next/navigation";
import { useState } from "react";

type Props = {
  promise: [Brewery, Beer[]];
};

export default function BreweryProfiles({ promise }: Props) {
  const [openCategory, setOpenCategory] = useState(null); // Add state for openCategory

  const [brewery, beers] = promise;

  if (!brewery.categories) redirect("/breweries");

  const categories = [...brewery?.categories];
  console.log({ openCategory });
  // Handle category change
  const handleCategoryClick = (categoryKey: any) => {
    setOpenCategory(categoryKey === openCategory ? null : categoryKey);
  };

  const content = (
    <section className="w-1/2 m-auto">
      <h1>{brewery.companyName}</h1>
      <div>
        {categories.map((category, i) => (
          // <div key={i}>{category.name}</div>
          <BeerCategory
            key={i}
            category={category}
            beers={beers}
            onClick={() => handleCategoryClick(i)}
            isOpen={openCategory === i}
          />
        ))}
        <div className="mt-10">
          <BeerCategory
            key="all"
            category={{ name: "All Beers" }}
            beers={beers}
            onClick={() => handleCategoryClick("all")}
            isOpen={openCategory === "all"}
          />

          <BeerCategory
            key="archived"
            category={{ name: "Archived" }}
            beers={beers}
            onClick={() => handleCategoryClick("archived")}
            isOpen={openCategory === "archived"}
          />
        </div>
      </div>
    </section>
  );

  return content;
}
