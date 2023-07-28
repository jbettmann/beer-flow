import MultipleInvites from "@/components/Invite/MultipuleInvites";
import SetSelectedContainer from "@/components/SetSelectedContainer";
import React from "react";
type pageProps = {
  params: {
    breweryId: string;
  };
};

const InviteNewStaffPage = ({ params: { breweryId } }: pageProps) => {
  return (
    <SetSelectedContainer breweryId={breweryId}>
      <MultipleInvites />
    </SetSelectedContainer>
  );
};

export default InviteNewStaffPage;
