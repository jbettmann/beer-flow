import EditCategoryLS from "@/components/LoadingSkeleton/EditCategoryNameLS";
import StaffManagementTableLS from "@/components/LoadingSkeleton/StaffManagementTableLS";

export default function Loading() {
  return (
    <div className="w-1/2 m-auto">
      <StaffManagementTableLS />
    </div>
  );
}
