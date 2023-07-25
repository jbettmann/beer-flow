"use client";
import { Beer } from "@/app/types/beer";
import { Brewery } from "@/app/types/brewery";
import { useBreweryContext } from "@/context/brewery-beer";
import getBreweryBeers from "@/lib/getBreweryBeers";
import { set } from "mongoose";
import { useSession } from "next-auth/react";
import React, { useEffect } from "react";
import useSWR from "swr";

type Props = {
  children: React.ReactNode;
  breweryId: string;
  brewery?: Brewery;
};

const SetSelectedContainer = ({ children, breweryId, brewery }: Props) => {
  const { data: session } = useSession();
  const { data: beers, error: beersError } = useSWR(
    [
      `https://beer-bible-api.vercel.app/breweries/${breweryId}/beers`,
      session?.user.accessToken,
    ],
    getBreweryBeers
  );
  const { setSelectedBeers, setSelectedBrewery } = useBreweryContext();

  useEffect(() => {
    setSelectedBeers(beers);
    if (brewery) {
      setSelectedBrewery(brewery);
    }
  }, [beers]);

  console.log({ beersError, beers, brewery });
  return <>{children}</>;
};

export default SetSelectedContainer;
