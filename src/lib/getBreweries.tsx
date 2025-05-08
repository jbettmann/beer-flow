"use server";
import { auth } from "@/auth";
import { httpClient } from "@/services/utils/httpClient";

export default async function getBreweries() {
  const session = await auth();
  const { breweries } = session?.user || {};

  try {
    const response = await httpClient.post(`/users/breweries`, {
      breweryIds: breweries,
    });

    const responseData = await response;
    return responseData.breweries;
  } catch (err) {
    console.error(err);
    return []; // Return empty array on error
  }
}
