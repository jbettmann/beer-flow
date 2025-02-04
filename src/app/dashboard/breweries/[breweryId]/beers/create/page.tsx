import CreateBeerForm from "@/components/CreateBeerForm/CreateBeerForm";
import PageContainer from "@/components/layout/page-container";
import BeerForm from "@/features/products/components/beer-form";
import React from "react";

export const metadata = {
  title: "Dashboard : Create New Beer",
};

type PageProps = {};

const CreateBeerPage = async (props: PageProps) => {
  return (
    <PageContainer scrollable>
      <BeerForm initialData={null} pageTitle={"Create New Beer"} />
    </PageContainer>
  );
};

export default CreateBeerPage;
