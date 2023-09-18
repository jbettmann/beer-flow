import CategoryContainer from "@/components/CategoryManagement/CategoryContainer";
import StaffManagementTableLS from "@/components/LoadingSkeleton/StaffManagementTableLS";
import { Suspense } from "react";

type Props = {};

const CategoriesManagementPage = (props: Props) => {
  return (
    <div className="py-3 md:p-8">
      <Suspense fallback={<StaffManagementTableLS />}>
        {/* @ts-expect-error Server Component */}
        <CategoryContainer />
      </Suspense>
    </div>
  );
};

export default CategoriesManagementPage;
