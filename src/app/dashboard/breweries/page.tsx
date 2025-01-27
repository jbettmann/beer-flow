// import { PageProps } from "../../../.next/types/app/layout";
import Breweries from "@/components/Breweries/Breweries";
import BreweriesPageLS from "@/components/LoadingSkeleton/BreweriesPageLS";
import getBreweries from "@/lib/getBreweries";
import { Suspense } from "react";
import { Brewery } from "../../types/brewery";

const BreweriesPage = async () => {
  const breweryData: Promise<Brewery[]> = getBreweries();
  const breweries = await breweryData;

  return (
    <section className="w-full h-screen sm:p-8 lg:p-8 lg:w-10/12 mx-auto">
      <Suspense fallback={<BreweriesPageLS />}>
        <Breweries breweries={breweries} />
      </Suspense>
    </section>
  );
};

export default BreweriesPage;
