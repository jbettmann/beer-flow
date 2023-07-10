import { Beer } from "@/app/types/beer";
import BeerCard from "@/components/BeerCard";
import BreweryProfiles from "@/components/BreweryProfiles";
import getSingleBeer from "@/lib/getSingleBeer";
import Link from "next/link";
import { notFound } from "next/navigation";

type pageProps = {
  params: {
    beerId: string;
  };
};

//  breweries/breweryId *********************************
export default async function SingleBeerPage({
  params: { beerId },
}: pageProps) {
  const allBeers: Beer[] = await getSingleBeer();

  const beer = allBeers.find((b) => b._id === beerId);

  console.log({ beer });

  if (!beer) return notFound();
  return (
    <div className="w-full h-full">
      <h2>
        <Link href="/">Back Home</Link>
      </h2>
      <BeerCard beer={beer} />
    </div>
  );
}
