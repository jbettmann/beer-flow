import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Users } from "@/app/types/users";
import axios from "axios";
import { Session } from "next-auth";
import { getServerSession } from "next-auth/next";
import React from "react";

export default async function getUser(session: Session) {
  // const session = await getServerSession(authOptions);

  const res = await fetch(
    `https://beer-bible-api.vercel.app/users/${session?.user.email}`,
    // ISR Incremental Static Regeneration. Static Site Generation or Server Side Rendering
    {
      method: "GET",

      headers: {
        authorization: `bearer ${session?.user.accessToken}`,
      },
    }
  );
  if (!res.ok) return undefined;
  const data = await res.json();
  return data;
}
