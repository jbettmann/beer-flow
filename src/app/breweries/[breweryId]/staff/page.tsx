import StaffManagementTableLS from "@/components/LoadingSkeleton/StaffManagementTableLS";
import StaffContainer from "@/components/StaffManagement/StaffContainer";
import StaffTable from "@/components/StaffManagement/StaffContainer";
import { Suspense } from "react";

type Props = {};

const BreweryStaffPage = (props: Props) => {
  return (
    <div className="py-3 md:p-8">
      <Suspense fallback={<StaffManagementTableLS />}>
        {/* @ts-expect-error Server Component */}
        <StaffContainer />
      </Suspense>
    </div>
  );
};

export default BreweryStaffPage;
