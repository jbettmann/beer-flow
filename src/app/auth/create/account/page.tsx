import CreateAccount from "@/components/CreateAccount/CreateAccount";
import LoginPageSkeleton from "@/components/skeletons/login-page-skeleton";
import React, { Suspense } from "react";

type Props = {};

const CreateAccountPage = (props: Props) => {
  return (
    <div className="w-full h-full mx-auto">
      <CreateAccount />
    </div>
  );
};

export default CreateAccountPage;
