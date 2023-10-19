// import { PageProps } from "../../../.next/types/app/layout";
import getBreweries from "@/lib/getBreweries";
import { Brewery } from "../types/brewery";
import Breweries from "@/components/Breweries/Breweries";
import { Suspense } from "react";
import BreweriesPageLS from "@/components/LoadingSkeleton/BreweriesPageLS";

const BreweriesPage = async () => {
  const breweryData: Promise<Brewery[]> = getBreweries();
  const breweries = await breweryData;

  return (
    <section className="w-full h-screen py-3 sm:p-8  lg:p-8 lg:w-10/12 mx-auto">
      <Suspense fallback={<BreweriesPageLS />}>
        <Breweries breweries={breweries} />
      </Suspense>
    </section>
  );
};

export default BreweriesPage;
