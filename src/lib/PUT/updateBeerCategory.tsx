import { Beer } from "@/app/types/beer";

type pageProps = {
  updatedCategory: string[] | string;
  accessToken: string | undefined;
  breweryId: string | undefined;
  beerId: string | null;
};

export default async function updateBeerCategory({
  updatedCategory,
  breweryId,
  beerId,
  accessToken,
}: pageProps) {
  if (accessToken && breweryId && beerId) {
    try {
      const response = await fetch(
        `https://beer-bible-api.vercel.app/breweries/${breweryId}/beers/${beerId}/category`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ category: updatedCategory }),
        }
      );

      if (!response.ok) {
        throw new Error(response.statusText);
      }
      // Call the `updateBeerCategory` function for each updated beer

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
