import { Brewery, NewBrewery } from "@/app/types/brewery";

type pageProps = {
  brewery: NewBrewery;
  accessToken: string | undefined;
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
