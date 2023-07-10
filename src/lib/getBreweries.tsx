import axios from "axios";
import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Users } from "@/app/types/users";
import { Session } from "next-auth";

export default async function getBreweries() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    try {
      const response = await fetch(
        `https://beer-bible-api.vercel.app/users/breweries`,
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
