import getSingleBeer from "@/lib/getSingleBeer";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { Beer } from "./types/beer";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";

export default async function Home() {
  const session = await getServerSession(authOptions);

  let savedBreweryId;
  if (typeof window !== "undefined") {
    savedBreweryId = localStorage.getItem("selectedBreweryId");
  }
  if (session?.user && savedBreweryId) {
    redirect(`/breweries/${savedBreweryId}`);
  }

  if (session?.user && !savedBreweryId && session.user.breweries.length > 0) {
    redirect(`/breweries`);
  }

  if (session?.user && !savedBreweryId) {
    let savedBreweryId = session?.user.breweries[0];
    redirect(`/breweries/${savedBreweryId}`);
  }

  console.log(session?.user);
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-background ">
      {session?.user.breweries ? (
        <div>
          {/* @ts-expect-error Server Component */}
          {/* <SingleBreweryPage breweryId={session?.user.breweries[0]} />{" "} */}
        </div>
      ) : (
        <div>NoSession</div>
      )}

      <Link href="/user">All Users</Link>
      <Link href="/breweries">All Breweries</Link>
    </main>
  );
}
