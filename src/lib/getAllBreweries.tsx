import axios from "axios";
import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function getAllBreweries() {
  // const session = await getServerSession(authOptions);

  const res = await fetch(`https://beer-bible-api.vercel.app/breweries`, {
    method: "GET",
    headers: {
      authorization: `bearer ${session?.user.accessToken}`,
    },
  });
  const data = await res.json();
  return data;
}
