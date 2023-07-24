import SetSelectedContainer from "@/components/SetSelectedContainer";
import UpdateCategory from "@/components/UpdateCategory/UpdateCategory";
import React from "react";

type pageProps = {
  params: {
    breweryId: string;
    categoryId: string;
  };
};

const EditCategories = ({ params: { breweryId, categoryId } }: pageProps) => {
  return (
    <SetSelectedContainer breweryId={breweryId}>
      <UpdateCategory breweryId={breweryId} categoryId={categoryId} />
    </SetSelectedContainer>
  );
};

export default EditCategories;
