import getBreweries from "@/lib/getBreweries";
import React from "react";

type Props = {
  breweryId: string;
};

const SingleBreweryPage = async ({ breweryId }: Props) => {
  const brewery = await getBreweries();
  if (!brewery) return <div>No Brewery by {brewery.companyName}</div>;
  return <div>{brewery.companyName}</div>;
};

export default SingleBreweryPage;
