import { Beer } from "@/app/types/beer";
import { Brewery } from "@/app/types/brewery";
import BeerCard from "@/components/BeerCard";
import BreweryProfiles from "@/components/BreweryProfiles";
import getBreweryBeers from "@/lib/getBreweryBeers";
import getSingleBeer from "@/lib/getSingleBeer";
import getSingleBrewery from "@/lib/getSingleBrewery";
import { useSession } from "next-auth/react";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import useSWR from "swr";

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
  const singleBrewery: Promise<Brewery> = getSingleBrewery(breweryId);

  const promise = await Promise.all([singleBrewery]);

  const [brewery] = promise;

  if (!brewery) return notFound();
  return (
    <div className="w-full h-full">
      <h2>
        <Link href="/">Back Home</Link>
      </h2>
      {/* @ts-expect-error Server component */}
      <BeerCard brewery={brewery} beerId={beerId} />
    </div>
  );
}
