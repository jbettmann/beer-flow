import { auth } from "@/auth";
import DeleteAccount from "@/components/Settings/DeleteAccount";

import React from "react";

const SettingsPage = async () => {
  const session = await auth();

  return (
    // Account info
    <div className="h-full">
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

export default SettingsPage;
