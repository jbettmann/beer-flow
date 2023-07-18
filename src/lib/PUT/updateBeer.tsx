import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Beer, NewBeer } from "@/app/types/beer";
import { Brewery, NewBrewery } from "@/app/types/brewery";
import { getServerSession } from "next-auth/next";

type pageProps = {
  updatedBeer: Beer;
  breweryId: string;
};

export default async function updateBeer({
  updatedBeer,
  breweryId,
}: pageProps) {
  const session = await getServerSession(authOptions);
  if (session?.user.accessToken) {
    try {
      const response = await fetch(
        `https://beer-bible-api.vercel.app/breweries/${breweryId}/beers/${updatedBeer._id}}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user.accessToken}`,
          },
          body: JSON.stringify(updatedBeer),
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
