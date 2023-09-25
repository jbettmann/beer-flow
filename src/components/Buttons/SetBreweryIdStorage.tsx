"use client";
import { Brewery } from "@/app/types/brewery";
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
      className="flex items-center justify-center gap-3"
    >
      {brewery?.image ? (
        <ImageDisplay item={brewery} className="logo" />
      ) : (
        brewery?.companyName && (
          <div className=" logo__default ">
            {getInitials(brewery.companyName || "")}
          </div>
        )
      )}
      <h6 className="font-bold">{brewery.companyName}</h6>
    </Link>
  );
};

export default SetBreweryIdStorage;
