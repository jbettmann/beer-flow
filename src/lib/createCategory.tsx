"use server";
import { auth } from "@/auth";
import { Brewery, NewBrewery } from "@/types/brewery";
import { Category, NewCategory } from "@/types/category";

type pageProps = {
  newCategory: NewCategory;
  breweryId: string | undefined;
};

export default async function createCategory({
  newCategory,
  breweryId,
}: pageProps) {
  const session = await auth();
  const { accessToken } = session?.user || {};
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

    return responseData;
  } catch (err) {
    console.error(err);
    throw err;
  }
}
