"use client";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { useSession } from "next-auth/react";

type pageProps = [url: string, token: string];

export default async function getBreweryBeers([url, token]: any) {
  if (token) {
    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        method: "GET",
      });

      if (!response.ok) {
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
