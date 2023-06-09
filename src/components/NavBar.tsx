"use-client";
import { Brewery } from "@/app/types/brewery";
import { Users } from "@/app/types/users";
import getBreweries from "@/lib/getBreweries";
import getUser from "@/lib/getUser";
import { Session } from "next-auth";

import { useSession } from "next-auth/react";
import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

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
                <h3 key={brewery._id}>{brewery.companyName}</h3>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  );
};

export default NavBar;
