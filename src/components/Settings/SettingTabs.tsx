"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { use, useState } from "react";

type Props = {};

const SettingTabs = (props: Props) => {
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
    <div className="m-6  ">
      <h2>Settings</h2>
      <div className="tabs mt-14 w-full  ">
        <Link
          href={`/settings`}
          className={`tab tab-bordered  ${
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
      </div>
    </div>
  );
};

export default SettingTabs;
