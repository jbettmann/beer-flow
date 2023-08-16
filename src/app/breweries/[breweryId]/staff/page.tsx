import StaffContainer from "@/components/StaffManagement/StaffContainer";
import StaffTable from "@/components/StaffManagement/StaffContainer";

type Props = {};

const BreweryStaffPage = (props: Props) => {
  return (
    <div className="p-8">
      {/* @ts-expect-error Server Component */}
      <StaffContainer />
    </div>
  );
};

export default BreweryStaffPage;
