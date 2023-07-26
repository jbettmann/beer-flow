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
 
  return (
    <div className="w-1/2 m-auto">
      <SetSelectedContainer breweryId={breweryId} >
        
        <UpdateCategory breweryId={breweryId} categoryId={categoryId} />
      </SetSelectedContainer>
    </div>
  );
};

export default EditCategories;
