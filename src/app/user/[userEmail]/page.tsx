import { Brewery } from "@/app/types/brewery";
import { Users } from "@/app/types/users";
import BreweryProfiles from "@/components/BreweryProfiles";
import getAllBreweries from "@/lib/getAllBreweries";
import fetchAllUsers from "@/lib/getAllUsers";
import getUser from "@/lib/getUser";
import type { Metadata } from "next";
import { Suspense } from "react";

import { notFound } from "next/navigation";

interface pageProps {
  //  params are important here! Need to get out of url
  params: {
    userEmail: string;
  };
}

// create dynamic metadata
export async function generateMetadata({
  params: { userEmail },
}: pageProps): Promise<Metadata> {
  // nextjs deduplicates since there are two of these api calls
  const userData: Promise<Users> = getUser();
  const user: Users = await userData;

  if (!user) {
    return {
      title: "User Not Found",
    };
  }
  return {
    title: user.fullName,
    description: `${user.fullName} Profile`,
  };
}

export default async function UserByEmailPage({
  params: { userEmail },
}: pageProps) {
  //  requesting data in parallel
  const userData: Promise<Users> = getUser();

  const breweryData: Promise<Brewery[]> = getAllBreweries(); // pass promise down to BreweryProfiles component

  //  resolve in parallel and wait for both. Start request at the same time. not a waterfall
  // const [user, breweries] = await Promise.all([userData, breweryData]);

  // Recommenced for loading and suspense
  const user = await userData;

  if (!user) notFound();

  return (
    <>
      <h2>{user?.fullName}</h2>
      <br />
      <Suspense fallback={<h2>Loading...</h2>}>
        {/* @ts-expect-error Server Component */}
        <BreweryProfiles promise={breweryData} />
      </Suspense>
    </>
  );
}

// //  turns SSR to SSG
// export async function generateStaticParams() {
//   const userData: Promise<Users[]> = fetchAllUsers();
//   const users = await userData;

//   return users.map((user) => ({ userEmail: user.email }));
// }
