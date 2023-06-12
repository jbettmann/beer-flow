"use-client";
import { Brewery } from "@/app/types/brewery";

import { useSession } from "next-auth/react";
import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import Link from "next/link";

const NavBar = async ({ breweries }: { breweries: Brewery[] }) => {
  return (
    <>
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
    </>
  );
};

export default NavBar;
