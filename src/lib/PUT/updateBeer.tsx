"use server";
import { Beer } from "@/app/types/beer";
import { revalidatePath } from "next/cache";
import { redirect } from "next/dist/server/api-utils";

type pageProps = {
  updatedBeer: Beer | any;
  breweryId: string | undefined;
  accessToken: string | undefined;
};

export default async function updateBeer({
  updatedBeer,
  breweryId,
  accessToken,
}: pageProps) {
  if (accessToken) {
    try {
      const response = await fetch(
        `https://beer-bible-api.vercel.app/breweries/${breweryId}/beers/${updatedBeer._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(updatedBeer),
          next: { revalidate: 0 },
        }
      );

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const responseData: Beer = await response.json();
      // revalidatePath(`/dashboard/breweries/[breweryId]`);
      // console.log({ responseData });
      return responseData;
    } catch (err) {
      console.error(err);
      throw err;
    }
  } else {
    throw new Error("User session not found.");
  }
}
