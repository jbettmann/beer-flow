import AcceptInvite from "@/components/Invite/AcceptInvite";
import React, { Suspense } from "react";

const AcceptInvitePage = () => {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading invite...</div>}>
      <AcceptInvite />
    </Suspense>
  );
};

export default AcceptInvitePage;
