import EditCategoryLS from "@/components/LoadingSkeleton/EditCategoryNameLS";
import StaffManagementTableLS from "@/components/LoadingSkeleton/StaffManagementTableLS";

export default function Loading() {
  return (
    <div className="w-full h-full m-auto">
      <StaffManagementTableLS />
    </div>
  );
}
