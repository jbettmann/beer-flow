import CreateAccount from "@/components/CreateAccount/CreateAccount";
import React from "react";

type Props = {};

const CreateAccountPage = (props: Props) => {
  return (
    <div className=" w-1/2 h-full mx-auto">
      <CreateAccount />
    </div>
  );
};

export default CreateAccountPage;
