import MultipleInvites from "@/components/Invite/MultipuleInvites";
import { redirect } from "next/navigation";

type pageProps = {
  params: {
    breweryId: string;
  };
};

const InviteNewStaffPage = ({ params: { breweryId } }: pageProps) => {
  if (!breweryId) redirect("/");
  return <MultipleInvites breweryId={breweryId} />;
};

export default InviteNewStaffPage;
