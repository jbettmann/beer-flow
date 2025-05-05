"use server";
import { auth } from "@/auth";
import { httpClient } from "@/services/utils/httpClient";
import { revalidatePath } from "next/cache";

export default async function deleteBeer(beerId: string) {
  const session = await auth();
  const { accessToken, selectedBreweryId } = session?.user || {};
  try {
    const response = await httpClient.delete(
      `/breweries/${selectedBreweryId}/beers/${beerId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const success = await response;
    if (!success) {
      throw new Error("Failed to delete beer. Please try again.");
    }

    return success;
  } catch (err) {
    console.error(err);
    throw new Error("Failed to delete beer. Please try again.");
  }
}
