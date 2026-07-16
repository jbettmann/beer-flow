"use server";
import { Users } from "@/types/users";
import { auth } from "@/auth";
import getSingleBrewery from "@/lib/getSingleBrewery";
import { getBreweryMemberId, getBreweryMemberIds } from "@/lib/brewery-members";

const getIsAdminServer = async (breweryId: string) => {
  const session = await auth();
  const selectedBrewery = await getSingleBrewery([
    `https://beer-bible-api.vercel.app/breweries/${breweryId}`,
  ]);

  const [user, brewery] = await Promise.all([session, selectedBrewery]);

  const breweryOwnerId = getBreweryMemberId(brewery?.owner);
  const adminIds = getBreweryMemberIds(brewery?.admin as Users[] | undefined);
  const userId = user?.user.id;

  if (!breweryOwnerId || !userId) {
    return false;
  }

  const isAdmin = new Set([...adminIds, breweryOwnerId]).has(userId);

  return isAdmin;
};

export default getIsAdminServer;
