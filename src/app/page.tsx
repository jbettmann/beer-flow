"use client";
import Image from "next/image";
import Link from "next/link";
import { signIn, signOut, useSession, getSession } from "next-auth/react";
import Layout from "./layout";
import { useEffect, useState } from "react";
import { redirect, usePathname } from "next/navigation";
import getUser from "@/lib/getUser";
import SingleBreweryPage from "./breweries/[breweryId]/page";

export default function Home() {
  const { data: session, status, update } = useSession();

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
