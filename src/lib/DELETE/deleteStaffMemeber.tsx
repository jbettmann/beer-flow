type pageProps = {
  breweryId: string;
  userId: string;
  accessToken: string | undefined;
};

export default async function deleteStaffMember({
  breweryId,
  userId,
  accessToken,
}: pageProps) {
  if (accessToken && userId) {
    try {
      const response = await fetch(
        `https://beer-bible-api.vercel.app/breweries/${breweryId}/staff/${userId}`,
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
    } catch (err) {
      console.error(err);

      throw new Error(err.error || err.message);
    }
  } else {
    throw new Error("Missing access token or user ID.");
  }
}
