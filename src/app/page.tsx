"use client";
import getSingleBeer from "@/lib/getSingleBeer";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { Beer } from "./types/beer";

export default function Home() {
  const { data: session, status, update } = useSession();

  let savedBreweryId;
  if (typeof window !== "undefined") {
    savedBreweryId = localStorage.getItem("selectedBreweryId");
  }
  if (session?.user && savedBreweryId) {
    redirect(`/breweries/${savedBreweryId}`);
  }

  if (session?.user && !savedBreweryId && session.user.breweries.length < 1) {
    redirect(`/breweries`);
  }

  console.log(session?.user);
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
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
