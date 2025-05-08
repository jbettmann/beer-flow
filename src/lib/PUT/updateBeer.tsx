"use server";
import { auth } from "@/auth";
import { httpClient } from "@/services/utils/httpClient";
import { Beer } from "@/types/beer";

export default async function updateBeer(updatedBeer: Beer) {
  const session = await auth();
  const { selectedBreweryId } = session?.user || {};

  try {
    const response = await httpClient.put(
      `/breweries/${selectedBreweryId}/beers`,
      updatedBeer._id,
      updatedBeer,
      {
        next: { revalidate: 0 },
      }
    );

    const responseData: Beer = await response;
    // revalidatePath(`/dashboard/breweries/[breweryId]`);
    return responseData;
  } catch (err) {
    console.error(err);
    throw err;
  }
}
