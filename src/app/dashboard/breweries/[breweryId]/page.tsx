import { auth } from "@/auth";
import BreweryProfiles from "@/components/BreweryProfiles";
import getBreweryBeers from "@/lib/getBreweryBeers";
import getSingleBrewery from "@/lib/getSingleBrewery";
import { getBreweryMemberId, getBreweryMemberIds } from "@/lib/brewery-members";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{
    breweryId: string;
  }>;
};

export default async function SingleBreweryPage({ params }: PageProps) {
  const { breweryId } = await params;
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
  const userId = session.user.id;
  const canManage = getBreweryMemberId(brewery.owner) === userId ||
    getBreweryMemberIds(brewery.admin).includes(userId);

  return (
    <div className="w-full overflow-y-auto">
      <BreweryProfiles brewery={brewery} categories={categories} data={breweryBeers} canManage={canManage} />
    </div>
  );
}
