import BeerCard from "@/components/BeerCard";
import BackArrow from "@/components/Buttons/BackArrow";
import Link from "next/link";
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
    <div className="w-full h-full ">
      <h2>
        <Link href={`/breweries/${breweryId}`}>
          <BackArrow width={"60"} height={"30"} />
        </Link>
      </h2>
      {/* SingleBeerPageContainer Only on [beerId] page to set selectedBeers State */}

      {/* @ts-expect-error Server component */}
      <BeerCard beerId={beerId} />
    </div>
  );
}
