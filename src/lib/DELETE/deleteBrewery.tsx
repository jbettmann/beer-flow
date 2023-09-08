type pageProps = {
  breweryId: string | undefined;

  accessToken: string | undefined;
};

export default async function deleteBrewery({
  breweryId,
  accessToken,
}: pageProps) {
  if (accessToken && breweryId) {
    try {
      const response = await fetch(
        `https://beer-bible-api.vercel.app/breweries/${breweryId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          method: "DELETE",
        }
      );

      const responseBody = await response.json();

      if (!response.ok) {
        throw new Error(responseBody.message || "An error occurred."); // Use the message from the response
      }

      return responseBody;
    } catch (err) {
      console.error(err);
      throw err; // Re-throw the error if needed
    }
  } else {
    throw new Error("Missing access token or brewery ID.");
  }
}
