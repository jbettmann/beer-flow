import MultipleInvites from "@/components/Invite/MultipuleInvites";
import SetSelectedContainer from "@/components/SetSelectedContainer";
import { redirect } from "next/navigation";

import React from "react";
type pageProps = {
  params: {
    breweryId: string;
  };
};

const InviteNewStaffPage = ({ params: { breweryId } }: pageProps) => {
  if (!breweryId) redirect("/");
  return (
    <SetSelectedContainer breweryId={breweryId}>
      <MultipleInvites breweryId={breweryId} />
    </SetSelectedContainer>
  );
};

export default InviteNewStaffPage;
