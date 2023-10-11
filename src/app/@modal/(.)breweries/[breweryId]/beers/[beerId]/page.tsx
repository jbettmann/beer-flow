import { Beer } from "@/app/types/beer";
import { Brewery } from "@/app/types/brewery";
import BeerCard from "@/components/BeerCard";
import BeerCardLS from "@/components/LoadingSkeleton/BeerCardLS";
import Modal from "@/components/Modal";
import getBreweryBeers from "@/lib/getBreweryBeers";
import getSingleBeer from "@/lib/getSingleBeer";
import getSingleBrewery from "@/lib/getSingleBrewery";
import React from "react";

type pageProps = {
  params: {
    breweryId: string;
    beerId: string;
  };
};

export default async function BeerModel({
  params: { breweryId, beerId },
}: pageProps) {
  // const singleBrewery: Promise<Brewery> = getSingleBrewery(breweryId);

  // const promise = await Promise.all([singleBrewery]);

  // const [brewery] = promise;

  return (
    <Modal closeButtonOnly={false}>
      {/* @ts-expect-error Server component */}
      <BeerCard beerId={beerId} />
    </Modal>
  );
}
