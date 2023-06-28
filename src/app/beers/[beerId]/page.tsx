import { Beer } from "@/app/types/beer";
import BreweryProfiles from "@/components/BreweryProfiles";
import getSingleBeer from "@/lib/getSingleBeer";
import { notFound } from "next/navigation";

type pageProps = {
  params: {
    beerId: string;
  };
};

//  breweries/breweryId *********************************
export default async function SingleBeerPage({
  params: { beerId },
}: pageProps) {
  const allBeers: Beer[] = await getSingleBeer();

  const beer = allBeers.find((b) => b._id === beerId);

  console.log({ allBeers, beer });

  if (!beer) return notFound();
  return (
    <div className="w-full h-full">
      <div>
        <h1>{beer.name}</h1>
        <p>ABV {beer.abv}%</p>
        <p>Style: {beer.style}</p>

        <p>
          Malt:{" "}
          {beer.malt.map((malt, i) => (
            <span key={i}>{malt} </span>
          ))}
        </p>
        <p>
          Hops:{" "}
          {beer.hops.map((hops, i) => (
            <span key={i}>{hops} </span>
          ))}
        </p>
        <p>Flavor Notes: {beer.flavorNotes}</p>
        <p>Aroma: {beer.aroma}</p>
        <p>Category: {beer.category}</p>
        <p>Name Details: {beer.nameSake}</p>
        <p>Other Notes: {beer.notes}</p>
      </div>
    </div>
  );
}
