"use client";
import { HelpCircle, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import BackArrow from "../Buttons/BackArrow";
import { useBreweryContext } from "@/context/brewery-beer";

type Props = {
  children: React.ReactNode;
};

const SetSideDrawerSettings = ({ children }: Props) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const { selectedBrewery } = useBreweryContext();
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
    } else if (pathname === "/settings/breweries") {
      setTitle("Breweries");
    } else {
      setTitle("");
    }
  }, [pathname]);

  return (
    <div className={`side-drawer__settings   ${isOpen ? "open" : ""}`}>
      <div className="flex justify-between items-center px-0 py-2">
        {/* @ts-expect-error Server component */}
        <BackArrow />

        <h4>{title}</h4>
        <Link href={"/help"} className=" flex flex-row items-center pr-2">
          <HelpCircle size={24} />
        </Link>
      </div>
      <div className="divider m-0!"></div>
      <div className="bg-background h-full overflow-y-auto pt-10 px-4 ">
        {children}
      </div>
    </div>
  );
};
export default SetSideDrawerSettings;
