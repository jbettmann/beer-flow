import UpdateBeerForm from "@/components/UpdateBeerForm/UpdateBeerForm";
import React from "react";

type Props = {
  beerId: string;
  breweryId: string;
};

const EditBeerPage = ({ breweryId, beerId }: Props) => {
  const getBeer = await getSingleBeer([
    `https://beer-bible-api.vercel.app/breweries/${brewery?._id}/beers`,);
  return (
    <div>
      <UpdateBeerForm brewery={breweryId} beer={beerId} />
    </div>
  );
};

export default EditBeerPage;
