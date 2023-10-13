"use client";
import React, { use, useEffect, useState } from "react";
import SideDrawer from "../Drawers/SideDrawer";
import { usePathname } from "next/navigation";
import BackArrow from "../Buttons/BackArrow";

type Props = {
  children: React.ReactNode;
};

const SetSideDrawerSettings = ({ children }: Props) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/settings") {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
    //  set title
    if (pathname === "/settings/account") {
      setTitle("Account");
    } else if (pathname === "/settings/profile") {
      setTitle("Profile");
    } else if (pathname === "/settings/notifications") {
      setTitle("Notifications");
    } else {
      setTitle("");
    }
  }, [pathname]);

  return (
    <div
      className={`side-drawer__settings z-20 bg-background p-4  ${
        isOpen ? "open" : ""
      }`}
    >
      <h2>{title}</h2>
      <div className="bg-background h-full overflow-y-auto">{children}</div>
    </div>
  );
};
export default SetSideDrawerSettings;
