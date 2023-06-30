"use client";
import { Brewery } from "@/app/types/brewery";
import { signIn, signOut, useSession } from "next-auth/react";
import React, { useEffect, useRef, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import Link from "next/link";
import { Users } from "@/app/types/users";
import brewery from "../../models/brewery";

const NavBar = ({
  breweries: initialBreweries,
  user,
}: {
  breweries: Brewery[];
  user: Users;
}) => {
  const [selectedBrewery, setSelectedBrewery] = useState<Brewery | null>(null);
  const [breweries, setBreweries] = useState(initialBreweries);
  const [open, setOpen] = useState(false);

  // Reference to the collapsible div
  const collapseDiv = useRef<HTMLDivElement>(null);

  const adminAllowed = breweries.map((brewery) =>
    brewery.admin.includes(user._id)
  );

  // On component mount, check if there's a brewery ID in local storage
  useEffect(() => {
    const savedBreweryId = localStorage.getItem("selectedBreweryId");
    if (savedBreweryId) {
      const savedBrewery = breweries.find((b) => b._id === savedBreweryId);
      if (savedBrewery) {
        setSelectedBrewery(savedBrewery);
      }
    }

    // Function to handle outside click
    function handleClickOutside(event: MouseEvent) {
      if (
        collapseDiv.current &&
        !collapseDiv.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    // Add the outside click handler
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup function
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [breweries]);

  const handleBreweryClick = (brewery: Brewery) => {
    // Save the clicked brewery's ID in local storage
    localStorage.setItem("selectedBreweryId", brewery._id);

    // Update the selected brewery
    setSelectedBrewery(brewery);
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

      <div>
        {adminAllowed ? <Link href={"/admin"}>Admin Edits</Link> : null}
      </div>
      <Link href={"/"}>Home</Link>
      <div
        className={`collapse  max-w-fit ${open ? "collapse-open" : ""}`}
        onClick={() => setOpen(!open)}
        ref={collapseDiv}
      >
        <div className="collapse-title text-xl font-medium">
          <div>{selectedBrewery?.companyName}</div>
          <div className="collapse-content">
            <div className="text-base">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavBar;
