"use client";
import { Beer } from "@/app/types/beer";
import { useBreweryContext } from "@/context/brewery-beer";
import getBreweryBeers from "@/lib/getBreweryBeers";
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
  const { setSelectedBeers } = useBreweryContext();

  useEffect(() => {
    setSelectedBeers(beers);
  }, [beers]);

  console.log(beersError);
  return <>{children}</>;
};

export default SetSelectedContainer;
