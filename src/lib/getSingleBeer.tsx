"use server";
import { auth } from "@/auth";

export default async function getSingleBeer(breweryId: string, beerId: string) {
  const session = await auth();

  if (session?.user) {
    try {
      const response = await fetch(
        `https://beer-bible-api.vercel.app/breweries/${breweryId}/beers/${beerId}`,

        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user.accessToken}`,
          },
          method: "GET",
        }
      );
      console.log(response);
      if (!response.ok) {
        throw new Error(response.statusText);
      }

      return await response.json();
    } catch (err) {
      console.error(err);
      return {}; // Return empty array on error
    }
  } else {
    return {}; // Return empty array if user has no breweries
  }
}
