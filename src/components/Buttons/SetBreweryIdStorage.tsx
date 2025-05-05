"use client";
import { Brewery } from "@/types/brewery";
import Link from "next/link";
import React from "react";
import ImageDisplay from "../ImageDisplay/ImageDisplay";
import { getInitials } from "@/lib/utils";

type Props = {
  href: string;
  brewery: Brewery;
};

const SetBreweryIdStorage = ({ href, brewery }: Props) => {
  const handleBreweryToStorage = () => {
    localStorage.setItem("selectedBreweryId", brewery._id);
    // Create a new event
    const selectedBreweryChangedEvent = new CustomEvent(
      "selectedBreweryChanged"
    );
    // Dispatch the event
    window.dispatchEvent(selectedBreweryChangedEvent);
  };
  return (
    <Link
      href={href}
      onClick={handleBreweryToStorage}
      className="flex flex-wrap  items-center justify-center gap-3"
    >
      {brewery?.image ? (
        <ImageDisplay item={brewery} className="logo w-12 h-12" />
      ) : (
        brewery?.companyName && (
          <div className=" logo__default p-3! ">
            {getInitials(brewery.companyName || "")}
          </div>
        )
      )}
      <h6 className="font-bold">{brewery.companyName}</h6>
    </Link>
  );
};

export default SetBreweryIdStorage;
