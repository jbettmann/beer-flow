"use client";
import { Beer } from "@/app/types/beer";
import { Category } from "@/app/types/category";
import { Users } from "@/app/types/users";
import { useBreweryContext } from "@/context/brewery-beer";
import { useIsMobile } from "@/hooks/use-mobile";
import { hopSuggestions, maltSuggestions } from "@/lib/suggestionsDB";
import { Beer as BeerIcon, Hop, Percent, Plus, X } from "lucide-react";
import { Suspense, useEffect, useMemo, useState } from "react";
import CreateModal from "./Alerts/CreateModal";
import BeerCard from "./BeerCard";
import BeerSnippet from "./BeerCardComponents/BeerSnippet";
import BeerCategory from "./BeerCategory";
import CreateBeerForm from "./CreateBeerForm/CreateBeerForm";
import BottomDrawer from "./Drawers/BottomDrawer";
import BreweryProfileSkeleton from "./LoadingSkeleton/BreweryProfileLS";
import { useSearchParams } from "next/navigation";

import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import ImageDisplay from "./ImageDisplay/ImageDisplay";
import { Separator } from "./ui/separator";

export default function BreweryProfiles({
  categories,
  data,
}: {
  categories: Category[];
  data: Beer[];
}) {
  const isMobile = useIsMobile();
  const {
    setSelectedBrewery,
    setSelectedBeers,
    selectedBrewery,
    selectedBeers,
    beersLoading,
    breweryLoading,
  } = useBreweryContext();
  console.log({ selectedBrewery, selectedBeers });
  // const [categories, setCategories] = useState<Category[]>(
  //   (selectedBrewery?.categories as Category[]) || []
  // );

  const getBeersForCategory = useMemo(() => {
    return (
      categories.map((category, i) => {
        return {
          title: category.name,
          beers:
            data?.filter((beer) =>
              beer.category
                ? beer?.category.some((cat) => cat.name === category.name) &&
                  !beer.archived
                : false
            ) || [],
        };
      }) || []
    );
  }, [data]);

  if (breweryLoading || beersLoading) return <BreweryProfileSkeleton />;
  console.log({ data });
  return (
    data && (
      <section className="py-3 lg:p-8 w-full  mt-10">
        <Suspense fallback={<BreweryProfileSkeleton />}>
          <div className="w-full space-y-8">
            {getBeersForCategory && getBeersForCategory.length > 0 ? (
              getBeersForCategory.map(
                (category, categoryIndex) =>
                  category.beers.length > 0 && (
                    <div key={categoryIndex} className="space-y-6">
                      <h2 className="capitalize">{category.title}</h2>

                      <Carousel
                        className="w-full max-w-full"
                        opts={{
                          align: "start",
                        }}
                      >
                        <CarouselContent className="-ml-1">
                          {category.beers.map((beer, beerIndex) => (
                            <CarouselItem
                              key={beerIndex}
                              className="pl-4 md:basis-1/2 lg:basis-1/3 min-w-max"
                            >
                              <Card>
                                <ImageDisplay
                                  item={beer}
                                  className="object-cover w-full h-64 rounded-t-lg aspect-square"
                                />

                                <CardContent className="p-4">
                                  <CardTitle className="text-2xl font-bold">
                                    {beer.name}

                                    <h6 className="text-gray-500 dark:text-gray-400 text-base text-left">
                                      {beer.style}
                                    </h6>
                                    <Card className="p-2 flex justify-between items-center w-full my-4">
                                      <div className="text-center text-base font-bold flex-1">
                                        {beer.abv}
                                        <h5 className="flex items-center justify-center gap-1 text-sm">
                                          <Percent
                                            size={16}
                                            className="text-indigo-500"
                                          />
                                          ABV
                                        </h5>
                                      </div>
                                      <Separator
                                        className="mx-2 h-10 bg-gray-400"
                                        orientation="vertical"
                                      />
                                      <h5 className="flex items-center justify-center gap-1 text-base w-1/3">
                                        {beer.style}
                                      </h5>
                                      <Separator
                                        className="mx-2 h-10 bg-gray-400"
                                        orientation="vertical"
                                      />
                                      <div className="text-center text-base font-bold flex-1">
                                        {beer.ibu}
                                        <h5 className="flex items-center justify-center gap-1 text-sm">
                                          <Hop
                                            size={16}
                                            className="text-indigo-500"
                                          />
                                          IBU
                                        </h5>
                                      </div>
                                    </Card>
                                  </CardTitle>
                                  <CardDescription className="text-gray-500 dark:text-gray-400 mt-2">
                                    {beer.description}
                                  </CardDescription>
                                </CardContent>
                                <CardFooter>
                                  {/* Hops */}
                                  {beer.hops.length > 0 && (
                                    <div className="flex flex-col my-4 gap-2">
                                      <h6 className="text-left">Hops</h6>
                                      <div className="flex flex-wrap gap-2">
                                        {beer.hops.map((hop) => (
                                          <Badge
                                            key={hop}
                                            className="bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-200"
                                          >
                                            {hop}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </CardFooter>
                              </Card>
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                        <CarouselPrevious />
                        <CarouselNext />
                      </Carousel>
                    </div>
                  )
              )
            ) : (
              <div className="text-center pt-6">
                <h5 className="text-center text-primary opacity-50">
                  No beers found
                </h5>
              </div>
            )}
          </div>
        </Suspense>
        {/* Beer Card View for Mobile */}
        {/* <BottomDrawer isOpen={bottomDrawerOpen}>
      
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
     
        {isAdmin &&
          (isMobile ? (
            <BottomDrawer isOpen={isCreateBeer}>
              <CreateBeerForm setIsCreateBeer={setIsCreateBeer} />
            </BottomDrawer>
          ) : (
            <CreateModal isOpen={isCreateBeer}>
              <CreateBeerForm setIsCreateBeer={setIsCreateBeer} />
            </CreateModal>
          ))} */}
      </section>
    )
  );
}
