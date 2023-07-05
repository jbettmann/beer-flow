import { Brewery } from "@/app/types/brewery";
import BreweryProfiles from "@/components/BreweryProfiles";

import getBreweryBeers from "@/lib/getBreweryBeers";
import getSingleBrewery from "@/lib/getSingleBrewery";
import { notFound } from "next/navigation";
import React from "react";

type pageProps = {
  params: {
    breweryId: string;
  };
};

//  breweries/breweryId *********************************
export default async function SingleBreweryPage({
  params: { breweryId },
}: pageProps) {
  const singleBrewery: Promise<Brewery> = getSingleBrewery(breweryId);
  const breweryBeers: Promise<Brewery[]> = getBreweryBeers(breweryId);

  const promise = await Promise.all([singleBrewery, breweryBeers]);

  if (!singleBrewery) return notFound();
  return (
    <div className="w-full h-full">
      {/* @ts-expect-error Server Component */}
      <BreweryProfiles promise={promise} />
    </div>
  );
}
