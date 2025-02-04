import BreweryProfiles from "@/components/BreweryProfiles";
import getSingleBrewery from "@/lib/getSingleBrewery";

import { notFound, redirect } from "next/navigation";

type pageProps = {
  params: {
    breweryId: string;
  };
};

export default async function SingleBreweryPage({ params }: pageProps) {
  const { breweryId } = await params;
  const selectedBrewery = await getSingleBrewery([
    `https://beer-bible-api.vercel.app/breweries/${breweryId}`,
  ]);
  if (!breweryId || breweryId === "undefined") redirect("/dashboard/breweries");

  return (
    <main className="w-full h-screen">
      {/* <BreweryProfiles categories={selectedBrewery.categories} data={}/> */}
    </main>
  );
}
