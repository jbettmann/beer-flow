import { Beer } from "@/app/types/beer";
import BeerCard from "@/components/BeerCard";
import Modal from "@/components/Modal";
import getSingleBeer from "@/lib/getSingleBeer";
import React from "react";

type pageProps = {
  params: {
    beerId: string;
  };
};

export default async function BeerModel({ params: { beerId } }: pageProps) {
  const allBeers: Beer[] = await getSingleBeer();

  const beer = allBeers.find((b) => b._id === beerId);
  return (
    <Modal>
      <BeerCard beer={beer} />
    </Modal>
  );
}
