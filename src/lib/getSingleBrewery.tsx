import axios from "axios";
import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Users } from "@/app/types/users";
import { Session } from "next-auth";

type pageProps = [url: string, token: string];

export default async function getSingleBrewery([url, token]: pageProps) {
  console.log({ url, token });
  if (token) {
    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        method: "GET",
      });

      if (response.status != 200) {
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
