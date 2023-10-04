type pageProps = {
  breweryId: string | undefined;
  userId: number | undefined;
  accessToken: string | undefined;
};

export default async function removeBreweryFromUser({
  breweryId,
  userId,
  accessToken,
}: pageProps) {
  if (accessToken && userId && breweryId) {
    try {
      const response = await fetch(
        `https://beer-bible-api.vercel.app/users/${userId}/breweries/${breweryId}`,
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
        // Extract error message from response body
        const errorMsg = responseBody.error || response.statusText;
        throw new Error(errorMsg);
      }

      return responseBody;
    } catch (err: any) {
      console.error(err);

      throw new Error(err.error || err.message);
    }
  } else {
    throw new Error("Missing access token or user ID.");
  }
}
