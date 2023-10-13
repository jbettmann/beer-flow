import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import DeleteAccount from "@/components/Settings/DeleteAccount";
import { getServerSession } from "next-auth/next";
import React from "react";

type Props = {};

const AccountPage = async (props: Props) => {
  const session = await getServerSession(authOptions);
  return (
    <div className="">
      <div className="settings-account__info">
        <p>Name</p>
        <p className="gray-text">{session?.user.name}</p>
      </div>
      <div className="settings-account__info">
        <p>Email address</p>
        <p className="gray-text">{session?.user.email}</p>
      </div>
      <div className="settings-account__info">
        <p>Membership Plan</p>
        <p className="gray-text"> Free*</p>
      </div>
      <div className="divider"></div>
      {/* Delete Account */}
      <DeleteAccount />
    </div>
  );
};

export default AccountPage;
