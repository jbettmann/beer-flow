"use client";
import React, { useState, useEffect, useRef, FC, ChangeEvent } from "react";
import {
  Beer as BeerGlass,
  ChevronRight,
  ExternalLink,
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
  const debounceTimeout = useRef<any>();

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

  const handleKeyPress = (e: any) => {
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
    <div className="mx-auto w-full lg:w-1/2 mb-16 lg:mb-0 pt-6 text-white">
      <div className="side-header">
        <div className="relative">
          {/* Input with padding on the right */}
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Search"
            className="input input-bordered rounded-full w-auto text-primary pr-8"
          />
          {searchTerm && (
            <button
              aria-label="Clear input"
              className="absolute inset-y-0 right-2 flex items-center opacity-50 cursor-pointer focus:outline-none"
              onClick={() => {
                setSearchTerm(""), handleSearch("");
              }}
            >
              <X size={20} color="#000" />
            </button>
          )}
        </div>
        <button
          className="btn btn-outline btn-accent rounded-full ml-2"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
      {/* Recent Searches  */}
      {!searchTerm && (
        <div className="flex p-4 justify-between items-start">
          <div className="search-result__container">
            <h4 className="text-accent">Recent Searches</h4>
            <div className="flex flex-col ml-2 mt-2 gap-1 ">
              {recentSearches.map((search, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setSearchTerm(search), handleSearch(search);
                  }}
                  className=" p-4 search-result__item hover:cursor-pointer"
                >
                  <p className="m-0" key={idx}>
                    {search}
                  </p>
                  <SearchIcon size={20} strokeWidth={1} color="#1fcdbc" />
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
        <div className="p-4 search-result__container">
          <h5 className="text-left text-accent ">Beer</h5>
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
                className=" p-4 search-result__item "
              >
                <div className="search-result__icon-name">
                  <BeerGlass size={20} strokeWidth={1} color="#1fcdbc" />
                  <p className="m-0">{beer.name}</p>
                </div>
                <ChevronRight size={24} strokeWidth={1} color="#1fcdbc" />
              </Link>
            ))
          )}
          {searchBeerResult.length === 0 && (
            <p className="text-primary0">No results found for {searchTerm}</p>
          )}
        </div>
      )}

      {/* // Search Hops Results */}
      {searchHopResult && searchHopResult.length > 0 && (
        <>
          <div className="divider px-5"></div>
          <div className="p-4 search-result__container">
            <h5 className="text-left text-accent ">Hops</h5>
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
                className=" p-4 search-result__item "
              >
                <div className="search-result__icon-name">
                  <Hop size={20} strokeWidth={1} color="#1fcdbc" />
                  <p className="m-0">{hop.name}</p>
                </div>
                <ExternalLink size={20} strokeWidth={1} color="#1fcdbc" />
              </a>
            ))}
          </div>
        </>
      )}

      {/* // Search Malts Results */}
      {searchMaltResult && searchMaltResult.length > 0 && (
        <>
          <div className="divider px-5"></div>
          <div className=" p-4 search-result__container">
            <h5 className="text-left text-accent ">Malts</h5>
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
                className=" p-4 search-result__item"
              >
                <div className="search-result__icon-name">
                  <Wheat size={20} strokeWidth={1} color="#1fcdbc" />
                  <p className="m-0">{malt.name}</p>
                </div>
                <ExternalLink size={20} strokeWidth={1} color="#1fcdbc" />
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
            <p className="text-primary0">No results found for {searchTerm}</p>
          </div>
        )}
    </div>
  );
};
