import React, { forwardRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "../ui/card";
import ImageDisplay from "../ImageDisplay/ImageDisplay";
import { Separator } from "@radix-ui/react-separator";
import { Percent, Hop } from "lucide-react";
import { Beer } from "@/types/beer";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import { ScrollArea } from "../ui/scroll-area";

type Props = {
  beer: Beer;
  cardClassName?: string;
};
const BeerCard = forwardRef<HTMLDivElement, Props>((props, ref) => {
  const { beer, cardClassName, ...rest } = props;
  return (
    <ScrollArea className="h-fit w-full ">
      <Card
        ref={ref}
        {...rest}
        className={cn(
          "w-full h-full max-h-[40rem] overflow-x-scroll hover:cursor-pointer py-0",
          cardClassName
        )}
      >
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
            <Card className="p-2 px-3 flex-row justify-between items-center w-full my-4">
              <div className="text-center text-base font-bold flex-1">
                {beer.abv}
                <h5 className="flex items-center justify-center gap-1 text-sm">
                  <Percent size={16} className="text-indigo-500" />
                  ABV
                </h5>
              </div>
              <Separator
                className=" h-10 w-0.5 bg-border"
                orientation="vertical"
              />
              <h5 className="flex items-center justify-center gap-1 text-base w-1/3">
                {beer.style}
              </h5>
              <Separator
                className=" h-10 w-0.5 bg-border"
                orientation="vertical"
              />
              <div className="text-center text-base font-bold flex-1">
                {beer.ibu}
                <h5 className="flex items-center justify-center gap-1 text-sm">
                  <Hop size={16} className="text-indigo-500" />
                  IBU
                </h5>
              </div>
            </Card>
          </CardTitle>
          <CardDescription className="text-gray-500 dark:text-gray-400 text-wrap line-clamp-3 mt-2">
            {beer.description}
          </CardDescription>
        </CardContent>
        <CardFooter className="flex-col items-start">
          {/* Hops */}
          {beer.hops.length > 0 && (
            <div className="flex flex-col my-4 gap-2">
              <h6 className="text-left">Hops</h6>
              <div className="flex flex-wrap gap-2">
                {beer.hops.map((hop, i) => (
                  <Badge
                    key={i + "hop"}
                    className="bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-200"
                  >
                    {hop}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {/* Malt */}
          {beer.malt.length > 0 && (
            <div className="flex flex-col my-4 gap-2">
              <h6 className="text-left">Malt</h6>
              <div className="flex flex-wrap gap-2">
                {beer.malt.map((malt, i) => {
                  return (
                    <Badge key={i + "malt"} variant={"secondary"}>
                      {malt}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
        </CardFooter>
      </Card>
    </ScrollArea>
  );
});

BeerCard.displayName = "BeerCard";

export default BeerCard;
