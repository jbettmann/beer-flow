import { Brewery, NewBrewery } from "@/app/types/brewery";
import { Category, NewCategory } from "@/app/types/category";

type pageProps = {
  newCategory: NewCategory;
  breweryId: string;
  accessToken: string | undefined;
};

export default async function createCategory({
  newCategory,
  breweryId,
  accessToken,
}: pageProps) {
  if (accessToken) {
    try {
      const response = await fetch(
        `https://beer-bible-api.vercel.app/breweries/${breweryId}/categories`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(newCategory),
        }
      );

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const responseData: Category = await response.json();
      console.log(responseData);
      return responseData;
    } catch (err) {
      console.error(err);
      throw err;
    }
  } else {
    throw new Error("User session not found.");
  }
}
