import AcceptInvite from "@/components/Invite/AcceptInvite";
import React, { Suspense } from "react";

type Props = {};

const AcceptInvitePage = (props: Props) => {
  return (
    <Suspense fallback={<div>Loading invite...</div>}>
      <AcceptInvite />
    </Suspense>
  );
};

export default AcceptInvitePage;
