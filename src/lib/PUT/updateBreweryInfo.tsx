import { Brewery } from "@/app/types/brewery";

type pageProps = {
  updatedBrewery: Brewery;
  breweryId: string;
  accessToken: string | undefined;
};

export default async function updateBreweryInfo({
  updatedBrewery,
  breweryId,
  accessToken,
}: pageProps) {
  if (accessToken && breweryId) {
    try {
      const response = await fetch(
        `https://beer-bible-api.vercel.app/breweries/${breweryId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(updatedBrewery),
        }
      );

      if (!response.ok) {
        const responseBody = await response.json();
        throw new Error(responseBody.error || response.statusText);
      }

      const responseData: Brewery = await response.json();

      return responseData;
    } catch (err) {
      console.error(err);
      throw err;
    }
  } else {
    throw new Error("Brewery or user session not found.");
  }
}
