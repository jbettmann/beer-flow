"use server";

import { auth } from "@/auth";

type pageProps = [url: string, token: string];

export default async function getSingleBrewery([url, token]: any) {
  const user = await auth();
  if (user?.user) {
    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.user.accessToken}`,
        },
        method: "GET",
      });

      if (response.status != 200) {
        throw new Error(response.statusText);
      }

      return await response.json();
    } catch (err) {
      console.error(err);
      return {};
    }
  } else {
    return {};
  }
}
