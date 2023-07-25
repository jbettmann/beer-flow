import { Brewery } from "@/app/types/brewery";
import SetSelectedContainer from "@/components/SetSelectedContainer";
import UpdateCategory from "@/components/UpdateCategory/UpdateCategory";
import getSingleBrewery from "@/lib/getSingleBrewery";
import React from "react";

type pageProps = {
  params: {
    breweryId: string;
    categoryId: string;
  };
};

const EditCategories = async ({
  params: { breweryId, categoryId },
}: pageProps) => {
  const singleBrewery: Promise<Brewery> = getSingleBrewery(breweryId);

  const brewery = await singleBrewery;
  const selectedCat = await brewery?.categories?.find(
    (category) => category._id === categoryId
  );
  return (
    <div className="w-1/2 m-auto">
      <SetSelectedContainer breweryId={breweryId} brewery={brewery}>
        <h4 className="text-center">Edit {selectedCat?.name} Category</h4>
        <UpdateCategory breweryId={breweryId} categoryId={categoryId} />
      </SetSelectedContainer>
    </div>
  );
};

export default EditCategories;
