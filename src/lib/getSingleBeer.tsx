import { auth } from "@/auth";

export default async function getSingleBeer() {
  const session = await auth();

  if (session?.user) {
    try {
      const response = await fetch(
        `https://beer-bible-api.vercel.app/beers`,

        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user.accessToken}`,
          },
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      return await response.json();
    } catch (err) {
      console.error(err);
      return []; // Return empty array on error
    }
  } else {
    return []; // Return empty array if user has no breweries
  }
}
