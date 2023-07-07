import { Beer } from "@/app/types/beer";
import BreweryProfiles from "@/components/BreweryProfiles";
import getSingleBeer from "@/lib/getSingleBeer";
import Link from "next/link";
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

  console.log({ beer });

  if (!beer) return notFound();
  return (
    <div className="w-full h-full">
      <h2>
        <Link href="/">Back Home</Link>
      </h2>
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
        <p>Hops: {beer.hops.map((hop) => hop).join(", ")}</p>
        <p>Description: {beer.flavorNotes}</p>
        <p>Aroma: {beer.aroma}</p>
        <p>
          Category:{" "}
          {beer.category.map((c, i) => (
            <span key={i}>{c.name}</span>
          ))}
        </p>
        <p>Name Details: {beer.nameSake}</p>
        <p>Other Notes: {beer.notes}</p>
      </div>
    </div>
  );
}
