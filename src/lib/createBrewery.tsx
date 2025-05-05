import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Brewery, NewBrewery } from "@/types/brewery";
import { auth } from "@/auth";

type pageProps = {
  brewery: NewBrewery;
  accessToken: string;
};

export default async function createBrewery({
  brewery,
  accessToken,
}: pageProps) {
  if (accessToken) {
    try {
      const response = await fetch(
        `https://beer-bible-api.vercel.app/breweries`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(brewery),
        }
      );

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const responseData: Brewery = await response.json();
      return responseData;
    } catch (err) {
      console.error(err);
      throw err;
    }
  } else {
    throw new Error("User session not found.");
  }
}
