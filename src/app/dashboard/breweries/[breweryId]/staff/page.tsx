import PageContainer from "@/components/layout/page-container";
import StaffContainer from "@/components/staff/staff-container";
import { Heading } from "@/components/ui/heading";

export const metadata = {
  title: "Dashboard : Staff Management",
};

type Props = {};

const StaffPage = (props: Props) => {
  return (
    <PageContainer scrollable={false}>
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
        <div className="flex items-start justify-between">
          <Heading
            title={`Staff Management`}
            description="Manage brewery staff members, roles, and invitations"
          />
        </div>

        <StaffContainer />
      </div>
    </PageContainer>
  );
};

export default StaffPage;
