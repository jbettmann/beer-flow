import React from "react";
import SettingsNavigation from "./SettingsNavigation";

type Props = {
  children: React.ReactNode;
};

const SettingTabs = ({ children }: Props) => {
  return (
    <div className="grid min-h-0 gap-6 lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start">
      <SettingsNavigation />

      <main className="min-w-0">{children}</main>
    </div>
  );
};

export default SettingTabs;
