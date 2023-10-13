"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { use, useState } from "react";
import SetSideDrawerSettings from "./SetSideDrawerSettings";

type Props = {
  children: React.ReactNode;
};

const SettingTabs = ({ children }: Props) => {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (
      path === "/settings/breweries" &&
      pathname.startsWith("/settings/breweries")
    ) {
      return true;
    }
    return pathname === path;
  };

  return (
    <div className="m-6  relative ">
      <h2>Settings</h2>
      <div className="flex flex-col lg:tabs lg:flex-row  mt-14 w-full">
        <Link
          href={`/settings`}
          className={`tab tab-bordered hidden lg:block ${
            isActive(`/settings`) ? "tab-active" : ""
          }`}
        >
          Account
        </Link>
        <Link
          href={`/settings/account`}
          className={`tab tab-bordered lg:hidden  ${
            isActive(`/settings`) ? "tab-active" : ""
          }`}
        >
          Account
        </Link>
        <Link
          href={`/settings/profile`}
          className={`tab tab-bordered  ${
            isActive(`/settings/profile`) ? "tab-active" : ""
          }`}
        >
          Profile
        </Link>
        <Link
          href={`/settings/notifications`}
          className={`tab tab-bordered  ${
            isActive(`/settings/notifications`) ? "tab-active" : ""
          }`}
        >
          Notifications
        </Link>
        <Link
          href={`/settings/breweries`}
          className={`tab tab-bordered  ${
            isActive(`/settings/breweries`) ? "tab-active" : ""
          }`}
        >
          Breweries
        </Link>
        <div
          className={` h-[2px] flex-1 bg-gray-400 opacity-20 hover:cursor-default `}
        ></div>
        <div className="lg:hidden">
          <SetSideDrawerSettings>{children}</SetSideDrawerSettings>
        </div>
      </div>
    </div>
  );
};

export default SettingTabs;
