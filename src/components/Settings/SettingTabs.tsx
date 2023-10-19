"use client";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { use, useState } from "react";
import SetSideDrawerSettings from "./SetSideDrawerSettings";
import { Bell, LogOut, UserCircle2, ShieldBan, Factory } from "lucide-react";

type Props = {
  children: React.ReactNode;
};

const SettingTabs = ({ children }: Props) => {
  const pathname = usePathname();

  // clear local storage when sign out
  const handleSignOut = () => {
    // After sign out, redirects next user to homepage
    signOut({ callbackUrl: `${window.location.origin}/` });
    // Clear local & session storage
    localStorage.removeItem("selectedBreweryId");
    sessionStorage.removeItem("openCategory");
    sessionStorage.removeItem("beerForm");
  };

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
    <div className="h-full py-6 px-0 md:p-6 flex flex-col  relative ">
      <h2 className="mb-4">Settings</h2>
      <div className="flex flex-col md:tabs md:flex-row bg-background justify-evenly space-y-4 w-full h-full">
        <div className="md:hidden">
          <SetSideDrawerSettings>{children}</SetSideDrawerSettings>
        </div>
        <Link
          href={`/settings`}
          className={`tab tab-bordered justify-start gap-2 hidden md:flex ${
            isActive(`/settings`) ? "tab-active" : ""
          }`}
        >
          <ShieldBan /> Account
        </Link>
        <Link
          href={`/settings/account`}
          className={`tab tab-bordered justify-start gap-2 md:hidden `}
        >
          <ShieldBan /> Account
        </Link>
        <Link
          href={`/settings/profile`}
          className={`tab tab-bordered justify-start gap-2  ${
            isActive(`/settings/profile`) ? "tab-active" : ""
          }`}
        >
          <UserCircle2 /> Profile
        </Link>
        <Link
          href={`/settings/notifications`}
          className={`tab tab-bordered justify-start gap-2  ${
            isActive(`/settings/notifications`) ? "tab-active" : ""
          }`}
        >
          <Bell /> Notifications
        </Link>
        <Link
          href={`/settings/breweries`}
          className={`tab tab-bordered justify-start gap-2  ${
            isActive(`/settings/breweries`) ? "tab-active" : ""
          }`}
        >
          <Factory /> Breweries
        </Link>
        <div
          className={`hidden md:block h-[2px] flex-1 bg-gray-400 opacity-20 hover:cursor-default `}
        ></div>
      </div>
      <div className="md:hidden mt-8 pl-4">
        <button
          className=" flex flex-row items-center "
          onClick={handleSignOut}
        >
          <LogOut size={24} />
          <h6 className="pl-3">Sign Out</h6>
        </button>
      </div>
    </div>
  );
};

export default SettingTabs;
