import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Beer, NewBeer } from "@/app/types/beer";
import { Brewery, NewBrewery } from "@/app/types/brewery";
import { getServerSession } from "next-auth/next";

type pageProps = {
  newBeer: NewBeer;
  breweryId: string;
  accessToken: string;
};

export default async function createBeer({
  breweryId,
  newBeer,
  accessToken,
}: pageProps) {
  if (accessToken) {
    try {
      const response = await fetch(
        `https://beer-bible-api.vercel.app/breweries/${breweryId}/beers`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(newBeer),
        }
      );

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const responseData: Beer = await response.json();
      return responseData;
    } catch (err) {
      console.error(err);
      throw err;
    }
  } else {
    throw new Error("User session not found.");
  }
}
