import { Brewery } from "@/app/types/brewery";
import CreateBeerForm from "@/components/CreateBeerForm/CreateBeerForm";
import Modal from "@/components/Modal";
import getSingleBrewery from "@/lib/getSingleBrewery";

type pageProps = {
  params: {
    breweryId: string;
  };
};

export default async function CreateBeer({ params: { breweryId } }: pageProps) {
  const singleBrewery: Promise<Brewery> = getSingleBrewery(breweryId);
  const brewery = await singleBrewery;

  return (
    <Modal closeButtonOnly={true}>
      <CreateBeerForm brewery={brewery} />
    </Modal>
  );
}
