import axios from "axios";
import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Users } from "@/app/types/users";
import { Session } from "next-auth";

export default async function getSingleBrewery(breweryId: string) {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    try {
      // using axios due to fetch problem with body length of array?
      const response = await fetch(
        `https://beer-bible-api.vercel.app/breweries/${breweryId}`,

        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user.accessToken}`,
          },
          method: "GET",
        }
      );

      if (response.status != 200) {
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
