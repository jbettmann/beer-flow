import { Beer } from "@/app/types/beer";
import { Brewery } from "@/app/types/brewery";
import BeerCategory from "./BeerCategory";
import { Category } from "@/app/types/category";
import { notFound, redirect } from "next/navigation";

type Props = {
  promise: Promise<[Brewery, Beer[]]>;
};

export default async function BreweryProfiles({ promise }: Props) {
  const [brewery, beers] = await promise;

  if (!brewery.categories) redirect("/breweries");

  const categories = [...brewery?.categories];

  const content = (
    <section className="w-1/2 m-auto">
      <h1>{brewery.companyName}</h1>
      <div>
        {categories.map((category, i) => (
          // <div key={i}>{category.name}</div>
          <BeerCategory key={i} category={category} beers={beers} />
        ))}
        <div className="mt-10">
          <BeerCategory
            key="all"
            category={{ name: "All Beers" }}
            beers={beers}
          />

          <BeerCategory
            key="archived"
            category={{ name: "Archived" }}
            beers={beers}
          />
        </div>
      </div>
    </section>
  );

  return content;
}
