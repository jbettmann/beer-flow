"use client";
import { useBreweryContext } from "@/context/brewery-beer";
import { useIsMobile } from "@/hooks/use-mobile";
import { Beer } from "@/types/beer";
import { Category } from "@/types/category";
import { Suspense, useMemo } from "react";

import BeerCard from "../cards/beer-card";
import { BeerDialogWrapper } from "../dialogs/beer-dialog-wrapper";
import BeerCardSkeleton from "../skeletons/beer-card-skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";

export default function BeerListCarousel({ data }: { data: Beer[] }) {
  const { beersLoading, breweryLoading, selectedBrewery } = useBreweryContext();

  const getBeersForCategory = useMemo(() => {
    return (
      (selectedBrewery &&
        selectedBrewery?.categories.map((category, i) => {
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
        })) ||
      []
    );
  }, [data]);

  if (breweryLoading || beersLoading) return <BeerCardSkeleton />;
  return (
    data && (
      <div className="relative flex flex-1 flex-col space-y-4 ">
        <div className="absolute bottom-0 left-0 right-0 top-0 flex overflow-scroll rounded-md  md:overflow-y-auto">
          <Suspense fallback={<BeerCardSkeleton />}>
            <div className="w-full space-y-8">
              {getBeersForCategory && getBeersForCategory.length > 0 ? (
                getBeersForCategory.map((category, categoryIndex, catArray) => {
                  return (
                    category.beers.length > 0 && (
                      <div key={categoryIndex} className="relative space-y-6 ">
                        <h2 className="capitalize">{category.title}</h2>

                        <Carousel
                          className="w-full max-w-full"
                          opts={{
                            align: "start",
                          }}
                        >
                          <CarouselContent>
                            {category.beers.map((beer, beerIndex) => (
                              <CarouselItem
                                key={beerIndex}
                                className="sm:basis-1/2 lg:basis-1/3 2xl:basis-1/4 min-w-80 "
                              >
                                <BeerDialogWrapper
                                  key={beerIndex + "dialog"}
                                  beer={beer}
                                >
                                  <BeerCard beer={beer} />
                                </BeerDialogWrapper>
                              </CarouselItem>
                            ))}
                          </CarouselContent>

                          <CarouselPrevious className="left-0" />

                          <CarouselNext className="-right-0" />
                        </Carousel>
                      </div>
                    )
                  );
                })
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
        </div>
      </div>
    )
  );
}
