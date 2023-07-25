type pageProps = {
  breweryId: string;
  categoryId: string;
  token: string;
};

export default async function deleteCategory({
  breweryId,
  categoryId,
  token,
}: pageProps) {
  console.log({ breweryId, categoryId, token });

  if (token && categoryId) {
    try {
      const response = await fetch(
        `https://beer-bible-api.vercel.app/breweries/${breweryId}/categories/${categoryId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          method: "DELETE",
        }
      );

      if (!response.ok) {
        console.log(response);
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
