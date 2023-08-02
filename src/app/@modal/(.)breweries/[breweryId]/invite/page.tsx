import MultipleInvites from "@/components/Invite/MultipuleInvites";
import Modal from "@/components/Modal";
import { redirect } from "next/navigation";

type pageProps = {
  params: {
    breweryId: string;
  };
};

const InviteNewStaffPage = ({ params: { breweryId } }: pageProps) => {
  if (!breweryId) redirect("/");
  return (
    <Modal>
      <MultipleInvites breweryId={breweryId} />
    </Modal>
  );
};

export default InviteNewStaffPage;
