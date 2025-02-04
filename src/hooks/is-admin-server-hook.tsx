import { Users } from "@/app/types/users";
import { auth } from "@/auth";
import getSingleBrewery from "@/lib/getSingleBrewery";
import React from "react";

const getIsAdminServer = async (breweryId: string) => {
  const session = await auth();
  const selectedBrewery = await getSingleBrewery([
    `https://beer-bible-api.vercel.app/breweries/${breweryId}`,
  ]);

  const [user, brewery] = await Promise.all([session, selectedBrewery]);

  const isAdmin = new Set([
    ...brewery?.admin?.map((admin: Users) => admin._id),
    brewery.owner._id,
  ]).has(user?.user.id);

  return isAdmin;
};

export default getIsAdminServer;
