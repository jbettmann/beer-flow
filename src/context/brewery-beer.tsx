"use client";
import { Beer } from "@/app/types/beer";
import { Brewery } from "@/app/types/brewery";
import getBreweryBeers from "@/lib/getBreweryBeers";
import getSingleBrewery from "@/lib/getSingleBrewery";
import { useGetBeerByBreweryId } from "@/services/queries/beers";
import { useGetBreweryById } from "@/services/queries/brewery";
import { be } from "@upstash/redis/zmscore-Dc6Llqgr";

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
  setBreweryId: (breweryId: string | null) => void;
  setSelectedBeers: React.Dispatch<React.SetStateAction<Beer[] | null>>;
  beersLoading: boolean | null;
  breweryLoading: boolean | null;
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

  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const router = useRouter();
  const { data: session, status } = useSession();
  const storedBreweryId =
    typeof window !== "undefined"
      ? localStorage?.getItem("selectedBreweryId")
      : session?.user.selectedBreweryId;
  const [breweryId, setBreweryId] = useState<string>(storedBreweryId as string);

  const {
    data: beers,
    isLoading: beersLoading,
    mutate: mutateBeers,
  } = useGetBeerByBreweryId(breweryId);

  const {
    data: brewery,
    isLoading: breweryLoading,
    mutate: mutateBrewery,
  } = useGetBreweryById(breweryId);

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
    if (brewery) {
      setSelectedBrewery(brewery);
    }
  }, [brewery]);

  useEffect(() => {
    if (beers !== undefined) {
      setSelectedBeers(beers);
    }
  }, [beers]);

  useEffect(() => {
    if (session?.user.selectedBreweryId) {
      setBreweryId(session.user.selectedBreweryId);
    }
  }, [session?.user.selectedBreweryId]);

  useEffect(() => {
    if (session && status === "authenticated") {
      if (!breweryId && session.user.breweries?.length > 0) {
        const firstBreweryId = session.user.breweries[0] as string;
        setBreweryId(firstBreweryId);
        localStorage.setItem("selectedBreweryId", firstBreweryId);
        router.push(`/dashboard/breweries/${firstBreweryId}/beers`);
      } else if (!breweryId) {
        router.push("/dashboard/overview");
      }
    }
  }, [session, status]);

  useEffect(() => {
    // set isAdmin
    if (brewery) {
      const isAdmin = isUserAdmin(brewery, session?.user?.id || "");
      const isOwner = isUserOwner(brewery, session?.user?.id || "");

      setIsAdmin(isAdmin || isOwner);
    }
  }, [beers, brewery, session?.user?.id]);

  return (
    <BreweryContext.Provider
      value={{
        selectedBrewery,
        setSelectedBrewery,
        setBreweryId: (breweryId: string | null) => {
          setBreweryId(breweryId as string);
          mutateBeers();
          mutateBrewery();
        },
        selectedBeers,
        setSelectedBeers,
        beersLoading,
        breweryLoading,
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
