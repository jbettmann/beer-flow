import { fakeProducts, Product } from "@/constants/mock-api";
import { notFound } from "next/navigation";
import BeerForm from "./beer-form";
import { Beer } from "@/app/types/beer";
import { useGetBeerById } from "@/services/queries/beers";
import { useAuthFetcher } from "@/hooks/use-auth-fetcher";
import { httpClientMethods } from "@/services/utils/httpClientMethods";
import { fetcher } from "@/services/fetcher";
import { auth } from "@/auth";

type BeerViewPageProps = {
  beerId: string;
};

export default async function BeerViewPage({ beerId }: BeerViewPageProps) {
  const session = await auth();
  let beer = null;
  let pageTitle = "Create New Beer";

  if (beerId !== "create") {
    const httpClient = httpClientMethods(fetcher);
    const options: RequestInit = {
      headers: {
        Authorization: `Bearer ${session?.user?.accessToken}`,
      },
    }; // Optional request settings

    const data = await httpClient
      .getById(
        `/breweries/${session?.user.selectedBreweryId}/beers/${beerId}`,
        options
      )
      .then((beer) => {
        console.log("Beer Data:", beer);
        return beer;
      })
      .catch((error) => {
        console.error("Error fetching beer:", error);
      });
    beer = data || ({} as Beer);
    if (!beer) {
      notFound();
    }
    pageTitle = `Edit ${beer.name}`;
  }

  return <BeerForm initialData={beer} pageTitle={pageTitle} />;
}
