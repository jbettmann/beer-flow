"use server";

import { auth } from "@/auth";
import { httpClient } from "@/services/utils/httpClient";
import { Beer, NewBeer } from "@/types/beer";

export default async function createBeer(newBeer: NewBeer) {
  const session = await auth();
  const { selectedBreweryId } = session?.user || {};
  try {
    const response = await httpClient.post(
      `/breweries/${selectedBreweryId}/beers`,
      newBeer
    );

    const responseData: Beer = await response;
    return responseData;
  } catch (err) {
    console.error(err);
    throw err;
  }
}
