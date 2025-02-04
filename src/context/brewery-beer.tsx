"use client";
import { Beer } from "@/app/types/beer";
import { Brewery } from "@/app/types/brewery";
import getBreweryBeers from "@/lib/getBreweryBeers";
import getSingleBrewery from "@/lib/getSingleBrewery";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
  isAdmin: boolean;
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
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const router = useRouter();
  const { data: session } = useSession();
  const storedBreweryId =
    typeof window !== "undefined"
      ? localStorage?.getItem("selectedBreweryId")
      : null;
  const [breweryId, setBreweryId] = useState<string | null>(
    storedBreweryId || null
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
    [`https://beer-bible-api.vercel.app/breweries/${breweryId}`],
    getSingleBrewery
  );

  const isUserAdmin = (brewery: Brewery, userId: string | number) => {
    if (brewery.admin) {
      if (typeof brewery.admin[0] === "string") {
        return brewery.admin.includes(userId as any);
      } else if (typeof brewery.admin[0] === "object") {
        return brewery.admin.some((admin: any) => admin._id === userId);
      }
    }
    return false;
  };

  const isUserOwner = (brewery: Brewery, userId: string | number) => {
    if (typeof brewery.owner === "string") {
      return brewery.owner === userId;
    } else if (brewery.owner && typeof brewery.owner === "object") {
      return brewery.owner._id === userId;
    }
    return false;
  };

  useEffect(() => {
    // Handler for the custom event
    const handleSelectedBreweryChanged = () => {
      const breweryId = localStorage.getItem("selectedBreweryId");
      setBreweryId(breweryId);
    };
    // Check if window object exists before adding an event listener
    if (typeof window !== "undefined") {
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
    }
  }, []); // Empty dependency array, so this runs only on mount and unmount

  // Watch for changes in breweryId and synchronize with local storage
  useEffect(() => {
    if (session) {
      // if no breweryId so set brewery to users first brewery
      if (
        (breweryId === null || breweryId === "undefined") &&
        session?.user?.breweries?.length! > 0
      ) {
        localStorage.setItem(
          "selectedBreweryId",
          session?.user?.breweries[0] as string
        );
        setBreweryId(session?.user?.breweries[0] as string);
        router.push(`/breweries/${session?.user?.breweries[0]}`);
      } else if (breweryId === null || breweryId === "undefined") {
        // no breweryId and no breweries to go to brewery page

        router.push("/breweries");
      } else {
        //  breweryId so set brewery to breweryId

        localStorage.setItem("selectedBreweryId", breweryId);
      }
    }
  }, [breweryId, session?.user]);

  useEffect(() => {
    setSelectedBeers(beers);
    setSelectedBrewery(brewery);
    setBeersLoading(isBeersLoading);
    setBreweryLoading(isBreweryLoading);
    // set isAdmin
    if (brewery) {
      const isAdmin = isUserAdmin(brewery, session?.user?.id || "");
      const isOwner = isUserOwner(brewery, session?.user?.id || "");

      setIsAdmin(isAdmin || isOwner);
    }
  }, [beers, brewery, isBeersLoading, isBreweryLoading, session?.user?.id]);

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
        isAdmin,
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
