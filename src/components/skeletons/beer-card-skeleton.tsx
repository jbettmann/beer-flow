import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const BeerCardSkeleton = () => {
  return (
    <div className="w-full space-y-8">
      {[...Array(3)].map((_, categoryIndex) => (
        <div key={categoryIndex} className="relative space-y-6 px-12">
          <div className="h-6 w-40 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />

          <div className="w-full max-w-full">
            <div className="flex overflow-x-auto space-x-4">
              {[...Array(4)].map((_, beerIndex) => (
                <div
                  key={beerIndex}
                  className="pl-4 md:basis-1/2 lg:basis-1/4 min-w-max"
                >
                  <Card className="animate-pulse">
                    <div className="w-full h-64 bg-gray-300 dark:bg-gray-700 rounded-t-lg" />
                    <CardContent className="p-4">
                      <CardTitle className="h-6 w-32 bg-gray-300 dark:bg-gray-700 rounded mb-2" />
                      <div className="h-4 w-20 bg-gray-300 dark:bg-gray-700 rounded mb-4" />

                      <div className="flex justify-between items-center w-full my-4">
                        <div className="flex-1 text-center">
                          <div className="h-6 w-12 bg-gray-300 dark:bg-gray-700 rounded" />
                          <div className="h-4 w-8 bg-gray-300 dark:bg-gray-700 rounded mt-2" />
                        </div>
                        <Separator
                          orientation="vertical"
                          className="h-10 bg-gray-400 dark:bg-gray-700"
                        />
                        <div className="h-6 w-20 bg-gray-300 dark:bg-gray-700 rounded" />
                        <Separator
                          orientation="vertical"
                          className="h-10 bg-gray-400 dark:bg-gray-700"
                        />
                        <div className="flex-1 text-center">
                          <div className="h-6 w-12 bg-gray-300 dark:bg-gray-700 rounded" />
                          <div className="h-4 w-8 bg-gray-300 dark:bg-gray-700 rounded mt-2" />
                        </div>
                      </div>

                      <div className="h-4 w-full bg-gray-300 dark:bg-gray-700 rounded mt-2" />
                      <div className="h-4 w-3/4 bg-gray-300 dark:bg-gray-700 rounded mt-2" />
                    </CardContent>

                    <CardFooter className="p-4">
                      <div className="h-5 w-16 bg-gray-300 dark:bg-gray-700 rounded mb-2" />
                      <div className="flex flex-wrap gap-2">
                        {[...Array(3)].map((_, hopIndex) => (
                          <Badge
                            key={hopIndex}
                            className="h-6 w-12 bg-gray-300 dark:bg-gray-700 rounded"
                          />
                        ))}
                      </div>
                    </CardFooter>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BeerCardSkeleton;
