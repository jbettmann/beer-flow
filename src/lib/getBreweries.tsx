import { auth } from "@/auth";

export default async function getBreweries() {
  const session = await auth();

  if (session?.user) {
    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_API_URL + `/users/breweries`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.user.accessToken}`,
          },
          body: JSON.stringify({ breweryIds: session.user.breweries }),
        }
      );

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const responseData = await response.json();
      return responseData.breweries;
    } catch (err) {
      console.error(err);
      return []; // Return empty array on error
    }
  } else {
    return []; // Return empty array if user has no breweries
  }
}
