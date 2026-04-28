"use server";
import { auth } from "@/auth";
import { buildApiUrl } from "@/lib/api/base";

export default async function getBreweryBeers([url, token]: any) {
  const user = await auth();

  if (user?.user) {
    try {
      const response = await fetch(buildApiUrl(url), {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.user.accessToken}`,
        },
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      return await response.json();
    } catch (err) {
      console.error(err);
      return [];
    }
  } else {
    return [];
  }
}
