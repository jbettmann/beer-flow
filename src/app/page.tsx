"use client";
import Image from "next/image";
import Link from "next/link";
import { signIn, signOut, useSession, getSession } from "next-auth/react";
import Layout from "./layout";
import { useEffect, useState } from "react";
import { redirect, usePathname } from "next/navigation";
import getUser from "@/lib/getUser";
import { useUser } from "@/context/userContext";

export default function Home() {
  const { data: session, status, update } = useSession({ required: true });

  console.log(session?.user);
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div>
        <>
          <p>{session?.user.fullName}</p>
          <button onClick={() => signOut()}>Sign Out</button>
        </>
      </div>

      <Link href="/user">All Users</Link>
      <Link href="/breweries">All Breweries</Link>
    </main>
  );
}
