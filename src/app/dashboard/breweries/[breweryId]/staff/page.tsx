import PageContainer from "@/components/layout/page-container";
import StaffContainer from "@/components/staff/staff-container";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Dashboard : Staff Management",
};

type Props = {};

const StaffPage = (props: Props) => {
  return (
    <PageContainer scrollable={false}>
      <div className="flex flex-1 flex-col space-y-4 ">
        <div className="flex items-start justify-between">
          <Heading
            title={`Staff Management`}
            description="Manage your staff members and their roles"
          />
        </div>

        <StaffContainer />
      </div>
    </PageContainer>
  );
};

export default StaffPage;
