"use client";
import { Brewery } from "@/app/types/brewery";
import Link from "next/link";
import React from "react";

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
    <Link href={href} onClick={handleBreweryToStorage}>
      {brewery.companyName}
    </Link>
  );
};

export default SetBreweryIdStorage;
