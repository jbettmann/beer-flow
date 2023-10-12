import CategoryContainer from "@/components/CategoryManagement/CategoryContainer";
import CategoryManagementLS from "@/components/LoadingSkeleton/CategoryManagmentLS/CategoryManagementLS";
import { Suspense } from "react";

type Props = {};

const CategoriesManagementPage = (props: Props) => {
  return (
    <div className="py-3 lg:p-8 lg:w-10/12 mx-auto">
      <Suspense fallback={<CategoryManagementLS />}>
        {/* @ts-expect-error Server Component */}
        <CategoryContainer />
      </Suspense>
    </div>
  );
};

export default CategoriesManagementPage;
