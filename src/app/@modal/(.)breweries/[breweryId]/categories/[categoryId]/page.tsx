import EditCategoryLS from "@/components/LoadingSkeleton/EditCategoryLS";
import Modal from "@/components/Modal";
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
    <Modal closeButtonOnly={false}>
      <UpdateCategory breweryId={breweryId} categoryId={categoryId} />
    </Modal>
  );
};

export default EditCategories;
