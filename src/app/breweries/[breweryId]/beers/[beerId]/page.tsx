import BeerCard from "@/components/BeerCard";
import { notFound } from "next/navigation";
type pageProps = {
  params: {
    breweryId: string;
    beerId: string;
  };
};

// revalidate: 0 means that the page will be regenerated on every request

//  breweries/breweryId *********************************
export default async function SingleBeerPage({
  params: { breweryId, beerId },
}: pageProps) {
  // const singleBrewery: Promise<Brewery> = getSingleBrewery(breweryId);

  // const promise = await Promise.all([singleBrewery]);

  // const [brewery] = promise;

  if (!beerId) return notFound();
  return (
    <section className="w-full sm:w-2/3 lg:w-1/2 mx-auto h-full ">
      {/* SingleBeerPageContainer Only on [beerId] page to set selectedBeers State */}

      {/* @ts-expect-error Server component */}
      <BeerCard beerId={beerId} />
    </section>
  );
}
