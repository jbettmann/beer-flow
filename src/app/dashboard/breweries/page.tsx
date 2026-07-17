// import { PageProps } from "../../../.next/types/app/layout";
import Breweries from "@/components/Breweries/Breweries";
import getBreweries from "@/lib/getBreweries";
import { Brewery } from "../../../types/brewery";

const BreweriesPage = async () => {
  const breweryData: Promise<Brewery[]> = getBreweries();
  const breweries = (await breweryData) || [];

  return (
    <section className="w-full overflow-y-auto">
        <Breweries breweries={breweries} />
    </section>
  );
};

export default BreweriesPage;
