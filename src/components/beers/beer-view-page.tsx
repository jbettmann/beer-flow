import { auth } from "@/auth";
import { fetcher } from "@/services/fetcher";
import { httpClientMethods } from "@/services/utils/httpClientMethods";
import { notFound } from "next/navigation";
import BeerForm from "./beer-form";
import { httpClient } from "@/services/utils/httpClient";

type BeerViewPageProps = {
  beerId: string;
};

export default async function BeerViewPage({ beerId }: BeerViewPageProps) {
  const session = await auth();
  let beer = null;
  let pageTitle = "Create New Beer";

  if (beerId !== "create") {
    // Called on server side

    try {
      const data = httpClient.getById(
        `/breweries/${session?.user.selectedBreweryId}/beers/${beerId}`
      );

      beer = await data;
    } catch (error) {
      console.error("Error fetching beer:", error);
      notFound();
    }

    pageTitle = `Edit ${beer.name}`;
  }

  return <BeerForm initialData={beer} pageTitle={pageTitle} />;
}
