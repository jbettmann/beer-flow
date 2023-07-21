type pageProps = {
  breweryId: string;
  beerId: string;
  token: string;
};

export default async function deleteBeers({
  breweryId,
  beerId,
  token,
}: pageProps) {
  if (token && beerId) {
    try {
      const response = await fetch(
        `https://beer-bible-api.vercel.app/breweries/${breweryId}/beers/${beerId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      return await response.json();
    } catch (err) {
      console.error(err);
      return {}; // Return empty array on error
    }
  } else {
    return {}; // Return empty array if user has no breweries
  }
}
