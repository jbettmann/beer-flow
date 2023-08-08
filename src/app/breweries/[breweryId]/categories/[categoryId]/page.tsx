import UpdateCategory from "@/components/UpdateCategory/UpdateCategory";

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
      <UpdateCategory breweryId={breweryId} categoryId={categoryId} />
    </div>
  );
};

export default EditCategories;
