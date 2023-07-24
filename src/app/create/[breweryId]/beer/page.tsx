import { Brewery } from "@/app/types/brewery";
import CreateBeerForm from "@/components/CreateBeerForm/CreateBeerForm";
import SetSelectedContainer from "@/components/SetSelectedContainer";
import getSingleBrewery from "@/lib/getSingleBrewery";

type pageProps = {
  params: {
    breweryId: string;
  };
};

export default async function CreateBeerPage({
  params: { breweryId },
}: pageProps) {
  const singleBrewery: Promise<Brewery> = getSingleBrewery(breweryId);
  const brewery = await singleBrewery;

  return (
    // SingleBeerPageContainer Only on [beerId] page to set selectedBeers State *
    <SetSelectedContainer breweryId={breweryId}>
      <CreateBeerForm brewery={brewery} />
    </SetSelectedContainer>
  );
}
