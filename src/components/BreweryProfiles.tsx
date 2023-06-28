import { Beer } from "@/app/types/beer";
import { Brewery } from "@/app/types/brewery";
import BeerCategory from "./BeerCategory";

type Props = {
  promise: Promise<[Brewery, Beer[]]>;
};

export default async function BreweryProfiles({ promise }: Props) {
  const [brewery, beers] = await promise;
  console.log(brewery, beers);
  const categories = [...brewery.categories];

  const content = (
    <section className="w-1/2 m-auto">
      <h1>{brewery.companyName}</h1>

      {categories.map((category, i) => (
        <BeerCategory key={i} category={category} beers={beers} />
      ))}
    </section>
  );

  return content;
}
