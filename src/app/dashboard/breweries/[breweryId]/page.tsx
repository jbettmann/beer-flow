import { auth } from "@/auth";
import BreweryProfiles from "@/components/BreweryProfiles";
import getBreweryBeers from "@/lib/getBreweryBeers";
import getSingleBrewery from "@/lib/getSingleBrewery";
import { notFound } from "next/navigation";

type PageProps = {
  params: {
    breweryId: string;
  };
};

export default async function SingleBreweryPage({ params }: PageProps) {
  const { breweryId } = params;
  const session = await auth();

  if (!session?.user?.accessToken) {
    notFound();
  }

  const [brewery, beers] = await Promise.all([
    getSingleBrewery([
      `/breweries/${breweryId}`,
      session.user.accessToken,
    ]),
    getBreweryBeers([
      `/breweries/${breweryId}/beers`,
      session.user.accessToken,
    ]),
  ]);

  if (!brewery?._id) {
    notFound();
  }

  const categories = Array.isArray(brewery.categories)
    ? brewery.categories
    : [];
  const breweryBeers =
    Array.isArray(beers) && beers.length > 0 ? beers : brewery.beers || [];

  return (
    <div className="w-full h-full">
      <BreweryProfiles categories={categories} data={breweryBeers} />
    </div>
  );
}
