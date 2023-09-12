"use client";
import React, { useState, useEffect, useRef, FC, ChangeEvent } from "react";
import {
  Beer as BeerGlass,
  Hop,
  Search as SearchIcon,
  Wheat,
  X,
} from "lucide-react";
import { useBreweryContext } from "@/context/brewery-beer";
import { Beer } from "@/app/types/beer";
import Link from "next/link";
import { hopSuggestions, maltSuggestions } from "@/lib/suggestionsDB";

interface SearchDrawerProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const Search: FC<SearchDrawerProps> = ({ isOpen, setIsOpen }) => {
  const { selectedBeers, selectedBrewery } = useBreweryContext();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchBeerResult, setSearchBeerResult] = useState<Beer[] | undefined>(
    []
  );
  const [searchHopResult, setSearchHopResult] = useState<any[]>([]);
  const [searchMaltResult, setSearchMaltResult] = useState<any[]>([]);

  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const debounceDelay = 300; // 300ms
  const debounceTimeout = useRef<number | undefined>();

  const handleSearch = (searchItem: string) => {
    const term = searchItem.toLowerCase();
    setSearchTerm(term);

    if (!term || term === "") {
      setSearchBeerResult([]);
      setSearchHopResult([]);
      setSearchMaltResult([]);
      return;
    }

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    setIsLoading(true); // Set loading state to true when starting search
    debounceTimeout.current = setTimeout(() => {
      const matchingHops = hopSuggestions
        .filter((hop) => hop.name.toLowerCase().includes(term))
        .slice(0, 5);
      const matchingMalts = maltSuggestions
        .filter((malt) => malt.name.toLowerCase().includes(term))
        .slice(0, 5);
      const matchingBeers = selectedBeers?.filter((beer) => {
        const { name, style, hops, malt, abv, ibu } = beer;
        const searchStr = `${name} ${style} ${abv} ${ibu} ${hops.join(
          " "
        )} ${malt.join(" ")}`
          .toLowerCase()
          .slice(0, 5);
        return (
          searchStr.includes(term) ||
          hops.some((hop) =>
            matchingHops
              .map((h) => h.name.toLowerCase())
              .includes(hop.toLowerCase())
          ) ||
          malt.some((maltItem) =>
            matchingMalts
              .map((m) => m.name.toLowerCase())
              .includes(maltItem.toLowerCase())
          )
        );
      });

      setSearchBeerResult(matchingBeers);
      setSearchHopResult(matchingHops);
      setSearchMaltResult(matchingMalts);
      setIsLoading(false);
    }, debounceDelay);
  };

  const onClose = () => {
    setIsOpen(false);
    setSearchTerm("");
    setSearchBeerResult([]);
    setSearchHopResult([]);
    setSearchMaltResult([]);
  };

  const saveSearchTerm = (term: string) => {
    if (term) {
      const updatedSearches = [term, ...recentSearches].slice(0, 5);
      localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
      setRecentSearches(updatedSearches);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      saveSearchTerm(searchTerm);
    }
  };

  const clearRecentSearches = () => {
    localStorage.removeItem("recentSearches");
    setRecentSearches([]);
  };

  // clean up
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  useEffect(() => {
    const savedSearches = localStorage.getItem("recentSearches");
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, [isOpen]);

  return (
    <div className="mx-auto w-full h-full lg:w-1/2 ">
      <div className="side-header">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Search"
          className=" input input-bordered w-auto text-primary relative"
        />
        {searchTerm && (
          <span
            className="absolute top-1/4 right-2 opacity-50 cursor-pointer"
            onClick={() => {
              setSearchTerm(""), handleSearch("");
            }}
          >
            <X size={20} color="#000" />
          </span>
        )}

        <button className="btn btn-outline btn-accent" onClick={onClose}>
          Cancel
        </button>
      </div>
      {!searchTerm && (
        <div className="flex  p-5 justify-between items-start ">
          <div className="flex flex-col">
            <h4>Recent Searches</h4>
            <div className="flex flex-col ml-2 mt-2 gap-1">
              {recentSearches.map((search, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setSearchTerm(search), handleSearch(search);
                  }}
                  className="flex items-center gap-2 p-2"
                >
                  <BeerGlass size={20} strokeWidth={1} />
                  <p className="m-0" key={idx}>
                    {search}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <button onClick={clearRecentSearches}>
            <X size={20} />
          </button>
        </div>
      )}
      {/* Search Results */}

      {/* // Search Beer Results */}
      {searchBeerResult && searchBeerResult.length > 0 && (
        <div className="flex flex-col p-4">
          <h5 className="text-left text-gray-50 text-opacity-80">Beer</h5>
          {isLoading ? (
            <span className="loading loading-bars loading-xs text-accent mx-auto"></span>
          ) : (
            searchBeerResult.map((beer) => (
              <Link
                key={beer._id}
                onClick={() => {
                  setSearchTerm(beer.name);
                  saveSearchTerm(beer.name);
                  onClose();
                }}
                href={`/breweries/${selectedBrewery?._id}/beers/${beer._id}`}
                className="flex items-center gap-2 p-4"
              >
                <BeerGlass size={20} strokeWidth={1} />{" "}
                <p className="m-0">{beer.name}</p>
              </Link>
            ))
          )}
          {searchBeerResult.length === 0 && (
            <p className="text-gray-500">No results found for "{searchTerm}"</p>
          )}
        </div>
      )}

      {/* // Search Hops Results */}
      {searchHopResult && searchHopResult.length > 0 && (
        <>
          <div className="divider px-5"></div>
          <div className="flex flex-col p-4">
            <h5 className="text-left text-gray-50 text-opacity-80">Hops</h5>
            {searchHopResult.map((hop) => (
              <a
                key={hop.id}
                onClick={() => {
                  setSearchTerm(hop.name);
                  saveSearchTerm(hop.name);
                  onClose();
                }}
                target="_blank"
                href={`https://www.beermaverick.com/hop/${hop.id}`}
                className="flex items-center gap-2 p-4"
              >
                <Hop size={20} strokeWidth={1} />
                <p className="m-0">{hop.name}</p>
              </a>
            ))}
          </div>
        </>
      )}

      {/* // Search Malts Results */}
      {searchMaltResult && searchMaltResult.length > 0 && (
        <>
          <div className="divider px-5"></div>
          <div className="flex flex-col p-4">
            <h5 className="text-left text-gray-50 text-opacity-80">Malts</h5>
            {searchMaltResult.map((malt) => (
              <a
                key={malt.id}
                onClick={() => {
                  setSearchTerm(malt.name);
                  saveSearchTerm(malt.name);
                  onClose();
                }}
                target="_blank"
                href={`https://www.google.com/search?q=${malt.id}+malt`}
                className="flex items-center gap-2 p-4"
              >
                <Wheat size={20} strokeWidth={1} />
                <p className="m-0">{malt.name}</p>
              </a>
            ))}
          </div>
        </>
      )}
      {/*  No result */}
      {searchBeerResult &&
        searchBeerResult.length === 0 &&
        searchHopResult.length === 0 &&
        searchMaltResult.length === 0 &&
        searchTerm !== "" && (
          <div className="w-full md:w-1/2 text-center">
            <p className="text-gray-500">No results found for "{searchTerm}"</p>
          </div>
        )}
    </div>
  );
};
