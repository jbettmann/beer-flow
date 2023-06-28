"use client";
import { Brewery } from "@/app/types/brewery";
import { signIn, signOut, useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import Link from "next/link";

const NavBar = ({ breweries: initialBreweries }: { breweries: Brewery[] }) => {
  const [selectedBrewery, setSelectedBrewery] = useState<Brewery | null>(null);
  const [breweries, setBreweries] = useState(initialBreweries);

  // On component mount, check if there's a brewery ID in local storage
  useEffect(() => {
    const savedBreweryId = localStorage.getItem("selectedBreweryId");
    if (savedBreweryId) {
      const savedBrewery = breweries.find((b) => b._id === savedBreweryId);
      if (savedBrewery) {
        setSelectedBrewery(savedBrewery);
      }
    }
  }, [breweries]);

  const handleBreweryClick = (brewery: Brewery) => {
    // Save the clicked brewery's ID in local storage
    localStorage.setItem("selectedBreweryId", brewery._id);

    // Update the selected brewery
    setSelectedBrewery(brewery);

    // Move selected brewery to the beginning of the array and remove duplicates
    const updatedBreweries = breweries.filter((b) => b._id !== brewery._id);
    updatedBreweries.unshift(brewery);

    // Ensuring uniqueness in breweries array
    const uniqueBreweries = updatedBreweries.filter(
      (v, i, a) => a.findIndex((t) => t._id === v._id) === i
    );

    setBreweries(uniqueBreweries);
  };

  return (
    <div className="flex flex-row-reverse justify-between">
      <div>
        {breweries ? (
          <button onClick={() => signOut()}>Sign Out</button>
        ) : (
          <button onClick={() => signIn()}>Sign In</button>
        )}
      </div>
      <Link href={"/"}>Home</Link>
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>
            <div>Breweries</div>
          </AccordionTrigger>
          <AccordionContent>
            <div>
              {breweries.map((brewery: Brewery) => (
                <Link
                  onClick={() => handleBreweryClick(brewery)}
                  key={brewery._id}
                  href={`/breweries/${brewery._id}`}
                >
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
