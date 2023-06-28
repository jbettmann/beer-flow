import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";

export default async function getBreweryBeers(breweryId: string) {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    try {
      // using axios due to fetch problem with body length of array?
      const response = await fetch(
        `https://beer-bible-api.vercel.app/breweries/${breweryId}/beers`,

        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user.accessToken}`,
          },
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      return await response.json();
    } catch (err) {
      console.error(err);
      return []; // Return empty array on error
    }
  } else {
    return []; // Return empty array if user has no breweries
  }
}
