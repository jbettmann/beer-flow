import { Beer } from "@/app/types/beer";
import { Brewery } from "@/app/types/brewery";
import BreweryProfiles from "@/components/BreweryProfiles";

import getBreweryBeers from "@/lib/getBreweryBeers";
import getSingleBrewery from "@/lib/getSingleBrewery";

import { notFound } from "next/navigation";

type pageProps = {
  params: {
    breweryId: string;
  };
};
export const revalidate = 0;
//  breweries/breweryId *********************************
export default async function SingleBreweryPage({
  params: { breweryId },
}: pageProps) {
  const singleBrewery: Promise<Brewery> = getSingleBrewery(breweryId);
  const breweryBeers: Promise<Beer[]> = getBreweryBeers(breweryId);

  const promise = await Promise.all([singleBrewery, breweryBeers]);

  console.log({ promise });
  if (!singleBrewery) return notFound();
  return (
    <main className="w-full h-full">
      <BreweryProfiles promise={promise} />
    </main>
  );
}
