"use client";
import { Beer } from "@/app/types/beer";
import { Brewery } from "@/app/types/brewery";
import { useBreweryContext } from "@/context/brewery-beer";
import getBreweryBeers from "@/lib/getBreweryBeers";
import getSingleBrewery from "@/lib/getSingleBrewery";
import { set } from "mongoose";
import { useSession } from "next-auth/react";
import React, { useEffect } from "react";
import useSWR from "swr";

type Props = {
  children: React.ReactNode;
  breweryId: string;
};

const SetSelectedContainer = ({ children, breweryId }: Props) => {
  const { data: session } = useSession();
  const { data: beers, error: beersError } = useSWR(
    [
      `https://beer-bible-api.vercel.app/breweries/${breweryId}/beers`,
      session?.user.accessToken,
    ],
    getBreweryBeers
  );
  const { data: brewery, error: breweryError } = useSWR(
    [
      `https://beer-bible-api.vercel.app/breweries/${breweryId}`,
      session?.user.accessToken,
    ],
    getSingleBrewery
  );
  const { setSelectedBeers, setSelectedBrewery } = useBreweryContext();

  useEffect(() => {
    setSelectedBeers(beers);
    if (brewery) {
      setSelectedBrewery(brewery);
    }
  }, [beers, brewery]);

  console.log({ beersError, beers, brewery });
  return <>{children}</>;
};

export default SetSelectedContainer;
