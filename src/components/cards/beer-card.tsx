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
import { Percent, Hop, Wheat } from "lucide-react";
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
    <Card
      ref={ref}
      {...rest}
      className={cn(
        "w-full h-full max-h-[45rem]  hover:cursor-pointer py-0",
        cardClassName
      )}
    >
      <ImageDisplay
        item={beer}
        className="object-cover w-full h-64 rounded-t-lg aspect-square"
      />

      <CardContent className="p-4 pb-0">
        <CardTitle className="text-2xl ">
          <div className="text-nowrap line-clamp-1">{beer.name}</div>

          <h6 className="text-gray-500 dark:text-gray-400 text-base text-left">
            {beer.style}
          </h6>
          <Card className="p-2 px-3 flex-row justify-between items-center w-full my-4">
            <div className="text-center text-base flex-1">
              {beer.abv}
              <h5 className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                % ABV
              </h5>
            </div>
            <Separator
              className=" h-10 w-0.5 bg-border"
              orientation="vertical"
            />
            <h5 className="flex items-center justify-center text-center gap-1 text-base w-1/3">
              {beer.style}
            </h5>
            <Separator
              className=" h-10 w-0.5 bg-border"
              orientation="vertical"
            />
            <div className="text-center text-base  flex-1">
              {beer.ibu}
              <h5 className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                IBU
              </h5>
            </div>
          </Card>
        </CardTitle>
        {beer.description && (
          <CardDescription className="text-gray-500 dark:text-gray-400 text-wrap line-clamp-3 mt-2">
            {beer.description}
          </CardDescription>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start">
        {/* Hops */}
        {beer.hops.length > 0 && (
          <div className="flex flex-col gap-2 w-full">
            <h6 className="text-left flex items-center gap-2 font-semibold text-sm">
              <Hop size={14} className="text-primary" />
              Hops
            </h6>
            <div className="w-full overflow-x-auto">
              <ScrollArea className="flex w-max">
                {beer.hops.map((hop, i) => (
                  <Badge
                    key={i + "hop"}
                    variant={"secondary"}
                    className="mr-2 "
                  >
                    {hop}
                  </Badge>
                ))}
              </ScrollArea>
            </div>
          </div>
        )}
        {/* Malt */}
        {beer.malt.length > 0 && (
          <div className="flex flex-col my-4 gap-2 w-full">
            <h6 className="text-left flex items-center gap-2 font-semibold text-sm">
              <Wheat size={14} className="text-primary" />
              Malts
            </h6>
            <div className="w-full overflow-x-auto">
              <ScrollArea className="flex w-max">
                {beer.malt.map((malt, i) => {
                  return (
                    <Badge
                      key={i + "malt"}
                      variant={"secondary"}
                      className="mr-2 "
                    >
                      {malt}
                    </Badge>
                  );
                })}
              </ScrollArea>
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
});

BeerCard.displayName = "BeerCard";

export default BeerCard;
