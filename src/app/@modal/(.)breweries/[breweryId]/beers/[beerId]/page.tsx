import BeerCard from "@/components/BeerCard";
import Modal from "@/components/Modal";

type pageProps = {
  params: {
    breweryId: string;
    beerId: string;
  };
};

export default async function BeerModel({
  params: { breweryId, beerId },
}: pageProps) {
  // const singleBrewery: Promise<Brewery> = getSingleBrewery(breweryId);

  // const promise = await Promise.all([singleBrewery]);

  // const [brewery] = promise;

  return (
    <Modal closeButtonOnly={false}>
      {/* @ts-expect-error Server component */}
      <BeerCard beerId={beerId} />
    </Modal>
  );
}
