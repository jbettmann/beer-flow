import React, { createContext, useState, useContext, FC } from "react";
import { Beer } from "@/app/types/beer";
import { Brewery } from "@/app/types/brewery";

type BreweryContextProps = {
  selectedBrewery: Brewery | null;
  setSelectedBrewery: (brewery: Brewery) => void;
  selectedBeers: Beer[] | null;
  setSelectedBeers: (beers: Beer[]) => void;
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

  return (
    <BreweryContext.Provider
      value={{
        selectedBrewery,
        setSelectedBrewery,
        selectedBeers,
        setSelectedBeers,
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
