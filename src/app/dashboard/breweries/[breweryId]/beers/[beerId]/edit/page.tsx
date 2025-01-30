import { Beer } from "@/app/types/beer";
import UpdateBeerForm from "@/components/UpdateBeerForm/UpdateBeerForm";
import getSingleBeer from "@/lib/getSingleBeer";
import getSingleBrewery from "@/lib/getSingleBrewery";
import React from "react";

type pageParams = {
  params: {
    beerId: string;
    breweryId: string;
  };
};

const EditBeerPage = async ({ params }: pageParams) => {
  const { beerId, breweryId } = await params;
  const getBeer = await getSingleBeer(breweryId, beerId);
  const getBrewery = await getSingleBrewery([
    `https://beer-bible-api.vercel.app/breweries/${breweryId}`,
  ]);

  const [brewery, beer] = await Promise.all([getBrewery, getBeer]);
  return (
    <div>
      <UpdateBeerForm brewery={brewery} beer={beer} />
    </div>
  );
};

export default EditBeerPage;
