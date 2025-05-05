import { Beer } from "@/types/beer";
import { Brewery } from "@/types/brewery";

type pageProps = {
  userId: string | undefined;
  accessToken: string | undefined;
  breweryId: string | undefined;
  action: string | null;
};

export default async function updateBreweryAdmin({
  userId,
  breweryId,
  action,
  accessToken,
}: pageProps) {
  if (accessToken && breweryId) {
    try {
      const response = await fetch(
        `https://beer-bible-api.vercel.app/breweries/${breweryId}/admins/${userId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ action: action }),
        }
      );

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const responseData = await response.json();

      console.log(responseData);
      return responseData;
    } catch (err) {
      console.error(err);
      throw err;
    }
  } else {
    throw new Error("Brewery not found.");
  }
}
