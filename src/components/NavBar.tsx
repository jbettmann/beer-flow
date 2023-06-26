"use client";
import { Brewery } from "@/app/types/brewery";

import { signIn, signOut, useSession, getSession } from "next-auth/react";
import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import Link from "next/link";

const NavBar = async ({ breweries }: { breweries: Brewery[] }) => {
  // const { data: session, status, update } = useSession();
  // const session = await getServerSession(authOptions);

  return (
    <div className="flex flex-row justify-between">
      <div>
        {breweries ? (
          <button onClick={() => signOut()}>Sign Out</button>
        ) : (
          <button onClick={() => signIn()}>Sign In</button>
        )}
      </div>
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>
            <div>Breweries</div>
          </AccordionTrigger>
          <AccordionContent>
            <div>
              {breweries.map((brewery: Brewery) => (
                <Link key={brewery._id} href={`/breweries/${brewery._id}`}>
                  <h3>{brewery.companyName}</h3>
                </Link>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default NavBar;
