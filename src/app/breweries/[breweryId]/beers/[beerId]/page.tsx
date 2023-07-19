import { Beer } from "@/app/types/beer";
import { Brewery } from "@/app/types/brewery";
import BeerCard from "@/components/BeerCard";
import BreweryProfiles from "@/components/BreweryProfiles";
import getSingleBeer from "@/lib/getSingleBeer";
import getSingleBrewery from "@/lib/getSingleBrewery";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

type pageProps = {
  params: {
    breweryId: string;
    beerId: string;
  };
};

// revalidate: 0 means that the page will be regenerated on every request

//  breweries/breweryId *********************************
export default async function SingleBeerPage({
  params: { breweryId, beerId },
}: pageProps) {
  console.log({ breweryId, beerId });
  const brewery: Brewery = await getSingleBrewery(breweryId);
  const allBeers: Beer[] = await getSingleBeer();

  const beer = allBeers.find((b) => b._id === beerId);

  console.log({ beer });

  if (!beer) return notFound();
  return (
    <div className="w-full h-full">
      <h2>
        <Link href="/">Back Home</Link>
      </h2>

      <BeerCard beer={beer} brewery={brewery} />
    </div>
  );
}
