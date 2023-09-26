"use client";
import { Beer } from "@/app/types/beer";
import { Brewery } from "@/app/types/brewery";
import getBreweryBeers from "@/lib/getBreweryBeers";
import getSingleBrewery from "@/lib/getSingleBrewery";

import { useSession } from "next-auth/react";
import React, {
  FC,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import useSWR from "swr";

type BreweryContextProps = {
  selectedBrewery: Brewery | null;
  setSelectedBrewery: React.Dispatch<React.SetStateAction<Brewery | null>>;
  selectedBeers: Beer[] | null;
  setSelectedBeers: React.Dispatch<React.SetStateAction<Beer[] | null>>;
  beersLoading: boolean | null;
  setBeersLoading: (loading: boolean) => void;
  breweryLoading: boolean | null;
  setBreweryLoading: (loading: boolean) => void;
};

const BreweryContext = createContext<BreweryContextProps | undefined>(
  undefined
);
type ProviderProps = {
  children: React.ReactNode;
};

export const BreweryProvider: FC<ProviderProps> = ({ children }) => {
  const [selectedBrewery, setSelectedBrewery] = useState<Brewery | null>(null);
  const [selectedBeers, setSelectedBeers] = useState<Beer[] | null>(null);
  const [beersLoading, setBeersLoading] = useState<boolean | null>(null);
  const [breweryLoading, setBreweryLoading] = useState<boolean | null>(null);

  const { data: session } = useSession();
  const [breweryId, setBreweryId] = useState<string | null>(
    localStorage.getItem("selectedBreweryId") || null
  );
  const {
    data: beers,
    error: beersError,

    isLoading: isBeersLoading,
  } = useSWR(
    [
      `https://beer-bible-api.vercel.app/breweries/${breweryId}/beers`,
      session?.user.accessToken,
    ],
    getBreweryBeers
  );

  const {
    data: brewery,
    error: breweryError,

    isLoading: isBreweryLoading,
  } = useSWR(
    [
      `https://beer-bible-api.vercel.app/breweries/${breweryId}`,
      session?.user.accessToken,
    ],
    getSingleBrewery
  );

  useEffect(() => {
    // Handler for the custom event
    const handleSelectedBreweryChanged = () => {
      const breweryId = localStorage.getItem("selectedBreweryId");
      setBreweryId(breweryId);
    };

    // Add the event listener
    window.addEventListener(
      "selectedBreweryChanged",
      handleSelectedBreweryChanged
    );

    // Cleanup function to remove the event listener
    return () => {
      window.removeEventListener(
        "selectedBreweryChanged",
        handleSelectedBreweryChanged
      );
    };
  }, []); // Empty dependency array, so this runs only on mount and unmount

  // Watch for changes in breweryId and synchronize with local storage
  useEffect(() => {
    if (breweryId) {
      localStorage.setItem("selectedBreweryId", breweryId);
    } else {
      localStorage.removeItem("selectedBreweryId");
    }
  }, [breweryId]);

  useEffect(() => {
    setSelectedBeers(beers);
    setSelectedBrewery(brewery);
    setBeersLoading(isBeersLoading);
    setBreweryLoading(isBreweryLoading);
  }, [beers, brewery, isBeersLoading, isBreweryLoading]);

  return (
    <BreweryContext.Provider
      value={{
        selectedBrewery,
        setSelectedBrewery,
        selectedBeers,
        setSelectedBeers,
        beersLoading,
        setBeersLoading,
        breweryLoading,
        setBreweryLoading,
      }}
    >
      {children}
    </BreweryContext.Provider>
  );
};

export const useBreweryContext = (): BreweryContextProps => {
  const context = useContext(BreweryContext);
  if (!context) {
    throw new Error("useBreweryContext must be used within a BreweryProvider");
  }
  return context;
};
