import { Beer } from "@/app/types/beer";
import { Brewery } from "@/app/types/brewery";
import BeerCard from "@/components/BeerCard";
import Modal from "@/components/Modal";
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
  console.log({ breweryId, beerId });
  const brewery: Brewery = await getSingleBrewery(breweryId);
  const allBeers: Beer[] = await getSingleBeer();

  const beer = allBeers.find((b) => b._id === beerId);
  return (
    <Modal closeButtonOnly={false}>
      <BeerCard beer={beer} brewery={brewery} />
    </Modal>
  );
}
