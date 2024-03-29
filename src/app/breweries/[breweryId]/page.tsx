import { Beer } from "@/app/types/beer";
import { Brewery } from "@/app/types/brewery";
import BreweryProfiles from "@/components/BreweryProfiles";

import getBreweryBeers from "@/lib/getBreweryBeers";
import getSingleBeer from "@/lib/getSingleBeer";
import getSingleBrewery from "@/lib/getSingleBrewery";

import { notFound, redirect } from "next/navigation";

type pageProps = {
  params: {
    breweryId: string;
  };
};
// export const revalidate = 0;
//  breweries/breweryId *********************************
export default async function SingleBreweryPage({
  params: { breweryId },
}: pageProps) {
  // removed for swr
  // const singleBrewery: Promise<Brewery> = getSingleBrewery(breweryId);

  // const promise = await Promise.all([singleBrewery]);
  if (!breweryId || breweryId === "undefined") redirect("/breweries");

  if (!breweryId) return notFound();
  return (
    <main className="w-full h-screen">
      <BreweryProfiles breweryId={breweryId} />
    </main>
  );
}
