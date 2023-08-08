import CreateBeerForm from "@/components/CreateBeerForm/CreateBeerForm";

type pageProps = {
  params: {
    breweryId: string;
  };
};

export default async function CreateBeerPage({
  params: { breweryId },
}: pageProps) {
  // const singleBrewery: Promise<Brewery> = getSingleBrewery(breweryId);
  // const brewery = await singleBrewery;

  return (
    // SingleBeerPageContainer Only on [beerId] page to set selectedBeers State *

    <CreateBeerForm />
  );
}
