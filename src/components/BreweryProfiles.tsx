"use client";
import { Category } from "@/app/types/category";
import { useBreweryContext } from "@/context/brewery-beer";
import { Beer as BeerIcon, Plus, X } from "lucide-react";
import Link from "next/link";
import { Suspense, use, useEffect, useMemo, useState } from "react";
import BeerCategory from "./BeerCategory";
import BreweryProfileSkeleton from "./LoadingSkeleton/BreweryProfileLS";
import { Beer } from "@/app/types/beer";
import BottomDrawer from "./Drawers/BottomDrawer";
import BeerCard from "./BeerCard";
import CreateBeerForm from "./CreateBeerForm/CreateBeerForm";
import EditModal from "./Alerts/EditModal";
import { debounce } from "@/lib/utils";
import CreateModal from "./Alerts/CreateModal";
import { Users } from "@/app/types/users";
import BeerSnippet from "./BeerCardComponents/BeerSnippet";
import { hopSuggestions, maltSuggestions } from "@/lib/suggestionsDB";

type pageProps = {
  breweryId: string;
};

export default function BreweryProfiles({ breweryId }: pageProps) {
  const {
    setSelectedBrewery,
    setSelectedBeers,
    selectedBrewery,
    selectedBeers,
    beersLoading,
    breweryLoading,
    isAdmin,
  } = useBreweryContext();

  // check for previous open category to prises open state
  const [openCategory, setOpenCategory] = useState<string | null | number>(
    null
  );
  const [categories, setCategories] = useState<Category[]>([]);
  // Mobile Beer Card View
  const [bottomDrawerOpen, setBottomDrawerOpen] = useState<boolean>(false);
  const [beerForDrawer, setBeerForDrawer] = useState<Beer | null>(null);
  // Mobile Create Beer View
  const [isCreateBeer, setIsCreateBeer] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [beerSearch, setBeerSearch] = useState<Beer[] | undefined>(undefined);
  const [beerSearchTerm, setBeerSearchTerm] = useState<string>("");

  const beersForCategory = useMemo(() => {
    return categories?.map((category, i) => {
      return selectedBeers?.filter((beer) =>
        beer.category
          ? beer?.category.some((cat) => cat.name === category.name) &&
            !beer.archived
          : false
      );
    });
  }, [selectedBeers, selectedBrewery, categories]);

  const searchBeers = (search: string) => {
    setBeerSearchTerm(search);
    const searchTerm = search.toLowerCase();

    if (search) {
      const matchingHops = hopSuggestions
        .filter((hop) => hop.name.toLowerCase().includes(searchTerm))
        .slice(0, 5);

      const matchingMalts = maltSuggestions
        .filter((malt) => malt.name.toLowerCase().includes(searchTerm))
        .slice(0, 5);
      const filteredBeers = selectedBeers?.filter((beer) => {
        const { name, style, hops, malt, abv, ibu } = beer;
        const searchStr = `${name} ${style} ${abv.toString()} ${
          ibu ? ibu.toString() : null
        } ${hops.join(" ")} ${malt.join(" ")}`.toLowerCase();

        return (
          searchStr.includes(searchTerm) ||
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
      setBeerSearch(filteredBeers);
    } else {
      setBeerSearch(undefined);
    }
  };

  // Handle category change
  const handleCategoryClick = (categoryKey: any) => {
    if (typeof window !== "undefined") {
      if (categoryKey === openCategory) {
        sessionStorage.removeItem("openCategory");
        setOpenCategory(null);
      } else {
        sessionStorage.setItem("openCategory", categoryKey);
        setOpenCategory(categoryKey);
      }
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleResize = () => {
        setIsMobile(window.innerWidth <= 768);
      };

      const debouncedResize = debounce(handleResize, 250); // 250ms delay

      window.addEventListener("resize", debouncedResize);

      return () => {
        window.removeEventListener("resize", debouncedResize);
      };
    }
  }, []);

  // watch for change in selected brewery and beer to update categories
  useEffect(() => {
    setCategories((selectedBrewery?.categories as Category[]) || []);
  }, [selectedBrewery, selectedBeers]);

  // console.log({ brewery, beers, session });
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedOpenCategory = sessionStorage.getItem("openCategory");
      setOpenCategory(storedOpenCategory);
    }

    // if (typeof window !== "undefined" && selectedBrewery) {
    //   localStorage.setItem("selectedBreweryId", selectedBrewery._id);
    // }
  }, [selectedBrewery?._id]);
  console.log({ selectedBeers, beersForCategory });

  if (breweryLoading || beersLoading) return <BreweryProfileSkeleton />;

  return (
    selectedBeers && (
      <section className="py-3 lg:p-8 lg:w-10/12 mx-auto mt-10">
        <Suspense fallback={<BreweryProfileSkeleton />}>
          {/* Large Screen New Category Button */}
          <div className="flex justify-between items-center ">
            <div className="flex flex-col w-fit mx-auto lg:m-0 lg:my-auto ">
              <h3 className="text-center lg:text-left">
                {selectedBrewery?.companyName}
              </h3>
              <div className="text-sm badge badge-ghost opacity-50 mt-2 ">
                Owner{" "}
                {(selectedBrewery &&
                  (selectedBrewery?.owner as Users)?.fullName) ||
                  ""}
              </div>
            </div>
            {/* Desktop create button */}
            {isAdmin && (
              <div className="hidden lg:flex justify-center items-center">
                <button
                  onClick={() => setIsCreateBeer(true)}
                  className="create-btn "
                >
                  <span className="flex justify-center items-center">
                    + Beer
                  </span>
                  <BeerIcon size={20} />
                </button>
              </div>
            )}
          </div>

          {/* Small Screen New Beer Button */}
          {isAdmin && (
            //  Small Screen New Beer Button
            <div className="fixed right-5 bottom-10 p-1 z-[2] lg:hidden ">
              <button
                onClick={() => setIsCreateBeer(true)}
                className="btn btn-circle btn-white create-btn !btn-lg"
              >
                <Plus size={28} />
              </button>
            </div>
          )}

          <div className="sm:w-3/4 md:w-1/2 xl:w-[40%] 2xl:w-1/3 mt-8 mx-auto py-3 md:mt-0 md:p-8">
            <h3 className="font-semibold">Beer List</h3>
            <div className="relative flex-auto">
              <label htmlFor="beerSearch"></label>
              <input
                name="beerSearch"
                id="beerSearch"
                type="text"
                className="search__input w-full my-2"
                placeholder="Search beers..."
                value={beerSearchTerm}
                onChange={(e) => searchBeers(e.target.value)}
              />
              {beerSearch && (
                <button
                  aria-label="Clear input"
                  className="absolute inset-y-0 right-2  flex items-center opacity-50 cursor-pointer focus:outline-none"
                  onClick={() => {
                    setBeerSearch(undefined), setBeerSearchTerm("");
                  }}
                >
                  <X size={20} color="#2b2b2b" />
                </button>
              )}
            </div>

            {beersForCategory.length > 0 && selectedBeers.length > 0 ? (
              beerSearch ? (
                beerSearch.length > 0 ? (
                  <div className="my-4 py-2 px-4 collapse collapse-open  category-card  category-card__open">
                    {beerSearch.map((beer) => {
                      return (
                        <div key={beer._id} className="">
                          <BeerSnippet
                            beer={beer}
                            breweryId={selectedBrewery?._id as string}
                            setBeerForDrawer={setBeerForDrawer}
                            setBottomDrawerOpen={setBottomDrawerOpen}
                          />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center pt-6">
                    <h5 className="text-center text-primary opacity-50">
                      No beers found
                    </h5>
                  </div>
                )
              ) : (
                beersForCategory.map((beers, i) => {
                  return (
                    <BeerCategory
                      key={categories[i]._id}
                      category={categories[i]}
                      beers={beers}
                      onClick={() => handleCategoryClick(i)}
                      isOpen={openCategory == i}
                      breweryId={selectedBrewery?._id}
                      setSelectedBrewery={setSelectedBrewery}
                      setBeerForDrawer={setBeerForDrawer}
                      setBottomDrawerOpen={setBottomDrawerOpen}
                    />
                  );
                })
              )
            ) : (
              <div className="text-center pt-6">
                <h5 className="text-center text-primary opacity-50">
                  No beers found
                </h5>
                {isAdmin && (
                  <div className="flex flex-col pt-6  justify-center items-center">
                    <button
                      onClick={() => setIsCreateBeer(true)}
                      className="create-btn "
                    >
                      <span className="flex justify-center items-center">
                        Create A Beer
                      </span>
                      <BeerIcon size={20} />
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="mt-10">
              <BeerCategory
                key="archived"
                category={{ name: "Archived" }}
                beers={selectedBeers}
                onClick={() => handleCategoryClick("archived")}
                isOpen={openCategory == "archived"}
                breweryId={selectedBrewery?._id}
                setSelectedBrewery={setSelectedBrewery}
                setBeerForDrawer={setBeerForDrawer}
                setBottomDrawerOpen={setBottomDrawerOpen}
              />
            </div>
          </div>
        </Suspense>
        {/* Beer Card View for Mobile */}
        <BottomDrawer isOpen={bottomDrawerOpen}>
          {/* @ts-expect-error Server component */}
          <BeerCard
            beerForDrawer={beerForDrawer as Beer}
            onClose={() => {
              setBottomDrawerOpen(false);
              setTimeout(() => {
                setBeerForDrawer(null);
              }, 500);
            }}
          />
        </BottomDrawer>
        {/* Create Beer for Mobile */}
        {isAdmin &&
          (isMobile ? (
            <BottomDrawer isOpen={isCreateBeer}>
              <CreateBeerForm setIsCreateBeer={setIsCreateBeer} />
            </BottomDrawer>
          ) : (
            <CreateModal isOpen={isCreateBeer}>
              <CreateBeerForm setIsCreateBeer={setIsCreateBeer} />
            </CreateModal>
          ))}
      </section>
    )
  );
}
