"use client";
import { Brewery } from "@/app/types/brewery";
import { useBreweryContext } from "@/context/brewery-beer";
import { getInitials } from "@/lib/utils";
import {
  Beer,
  Factory,
  HelpCircle,
  Home,
  LayoutGrid,
  PlusCircle,
  Search as SearchIcon,
  Settings,
  Skull,
  Users as Staff,
  UserCircle,
} from "lucide-react";
import { Session } from "next-auth";
import { signIn, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import SideDrawer from "./Drawers/SideDrawer";
import ImageDisplay from "./ImageDisplay/ImageDisplay";
import { Search } from "./Search/Search";
import { Users } from "@/app/types/users";

const NavBar = ({
  breweries,
  user,
}: {
  breweries: Brewery[];
  user: Session;
}) => {
  const { selectedBrewery, setSelectedBrewery } = useBreweryContext();
  const [adminAllowed, setAdminAllowed] = useState(false);

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Reference to the drawer div
  const drawerRef = useRef<HTMLDivElement>(null);
  const checkBoxRef = useRef<HTMLInputElement>(null);

  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  const closeDrawer = () => {
    checkBoxRef.current?.click();
  };

  const isUserAdmin = (brewery: Brewery, userId: string) => {
    if (brewery.admin) {
      if (typeof brewery.admin[0] === "string") {
        return brewery.admin.includes(userId as any);
      } else if (typeof brewery.admin[0] === "object") {
        return brewery.admin.some((admin: any) => admin._id === userId);
      }
    }
    return false;
  };

  const isUserOwner = (brewery: Brewery, userId: string) => {
    if (typeof brewery.owner === "string") {
      return brewery.owner === userId;
    } else if (brewery.owner && typeof brewery.owner === "object") {
      return brewery.owner._id === userId;
    }
    return false;
  };

  // Sets local storage and selectedBrewery when a brewery is clicked
  const handleBreweryClick = (brewery: Brewery) => {
    // Save the clicked brewery's ID in local storage
    localStorage.setItem("selectedBreweryId", brewery._id);
    // Dispatch a custom event to notify other parts of the app
    const event = new Event("selectedBreweryChanged");
    window.dispatchEvent(event);
    sessionStorage.removeItem("openCategory");

    // Update the selected brewery
    setSelectedBrewery(brewery);

    // Close the drawer
    closeDrawer();
  };

  // clear local storage when sign out
  const handleSignOut = () => {
    // After sign out, redirects next user to homepage
    signOut({ callbackUrl: `${window.location.origin}/` });
    // Clear local & session storage
    localStorage.removeItem("selectedBreweryId");
    sessionStorage.removeItem("openCategory");
    sessionStorage.removeItem("beerForm");
  };

  // On component mount, check if there's a brewery ID in local storage
  useEffect(() => {
    const savedBreweryId = localStorage.getItem("selectedBreweryId");
    if (savedBreweryId) {
      const savedBrewery = breweries?.find((b) => b._id === savedBreweryId);
      if (savedBrewery) {
        setSelectedBrewery(savedBrewery);
      }
    }
  }, [breweries]);

  // set user admin status
  useEffect(() => {
    if (selectedBrewery) {
      const isAdmin = isUserAdmin(selectedBrewery, user?.user.id || "");
      const isOwner = isUserOwner(selectedBrewery, user?.user.id || "");

      setAdminAllowed(isAdmin || isOwner);
    }
  }, [selectedBrewery]);

  return (
    <>
      <SideDrawer isOpen={isSearchOpen}>
        <Search isOpen={isSearchOpen} setIsOpen={setIsSearchOpen} />
      </SideDrawer>

      <div className="navbar justify-between  ">
        <div className="drawer w-fit p-3 ">
          <input
            id="menu-drawer"
            type="checkbox"
            className="drawer-toggle"
            ref={checkBoxRef}
          />
          <div className={`flex flex-row justify-between drawer-content`}>
            <div className="text-xl font-medium" ref={drawerRef}>
              <label
                htmlFor="menu-drawer"
                className="drawer-button flex flex-row items-center"
              >
                <div>
                  {selectedBrewery?.image ? (
                    <ImageDisplay item={selectedBrewery} className="logo" />
                  ) : (
                    selectedBrewery?.companyName && (
                      <div className=" logo__default ">
                        {getInitials(selectedBrewery.companyName || "")}
                      </div>
                    )
                  )}
                </div>
                <h6 className="pl-3 text-sm">{selectedBrewery?.companyName}</h6>
              </label>
            </div>
          </div>
          <div className="drawer-side z-50 text-background">
            <label htmlFor="menu-drawer" className="drawer-overlay "></label>
            <div className="h-full flex flex-col justify-between menu-drawer">
              <div className="menu p-6 w-80 h-full gap-3">
                <h4 className="py-4">Breweries</h4>

                {breweries.map((brewery: Brewery) => (
                  <li
                    key={brewery._id}
                    className="category-card rounded-xl p-2"
                  >
                    <Link
                      key={brewery._id}
                      href={`/breweries/${brewery._id}`}
                      className="flex flex-row items-center text-left"
                      onClick={() => handleBreweryClick(brewery)}
                    >
                      {brewery.image ? (
                        <ImageDisplay item={brewery} className="logo" />
                      ) : (
                        <div className="logo__default">
                          {getInitials(brewery.companyName)}
                        </div>
                      )}
                      <h6 className="pl-3 text-left text-xs">
                        {brewery.companyName}
                      </h6>
                    </Link>
                  </li>
                ))}
              </div>
              <div className="flex flex-col justify-center border-t-2 p-3 menu">
                <li onClick={closeDrawer}>
                  <Link
                    href={"/create/brewery"}
                    className="  flex flex-row items-center"
                  >
                    <PlusCircle size={24} />
                    <h6 className="pl-3">Create Brewery</h6>
                  </Link>
                </li>

                <li onClick={closeDrawer}>
                  <Link
                    href={"/settings"}
                    className="  flex flex-row items-center"
                  >
                    <Settings size={24} />
                    <h6 className="pl-3">Settings</h6>
                  </Link>
                </li>

                <li onClick={closeDrawer}>
                  <Link href={"/help"} className=" flex flex-row items-center">
                    <HelpCircle size={24} />
                    <h6 className="pl-3">Help</h6>
                  </Link>
                </li>
              </div>
            </div>
          </div>
        </div>
        <Link
          href={`/breweries/${selectedBrewery?._id}`}
          className="hidden lg:block"
        >
          {selectedBrewery?.image ? (
            <ImageDisplay item={selectedBrewery} className="logo" />
          ) : (
            selectedBrewery?.companyName && (
              <div className=" logo__default ">
                {getInitials(selectedBrewery.companyName || "")}
              </div>
            )
          )}
        </Link>
        <div className="flex-none gap-2">
          <div
            className="form-control relative"
            onClick={() => setIsSearchOpen(true)}
          >
            <SearchIcon size={24} strokeWidth={2} />
          </div>
          {/* Profile Photo with Option Dropdown */}
          <div className="hidden lg:block dropdown dropdown-end ">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
              <Image
                src={user.user.picture}
                alt={`profile picture of ${user.user.name}`}
                className="beer-category__image"
                width={50}
                height={50}
              />
            </label>
            <ul
              tabIndex={0}
              className="mt-3 z-[1] p-2 shadow menu menu-md dropdown-content bg-base-100 text-primary min-w-max w-56 rounded-box "
            >
              {adminAllowed && (
                <div className="border-b-2">
                  <p className="text-xs text-gray-400 mb-0">
                    {selectedBrewery?.companyName} Management
                  </p>
                  <ul className="menu">
                    <li>
                      <Link
                        href={`/breweries/${selectedBrewery?._id}/categories`}
                        className="flex flex-row items-center"
                      >
                        <LayoutGrid size={24} />
                        <h6 className="pl-3">Categories</h6>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href={`/breweries/${selectedBrewery?._id}/staff`}
                        className="flex flex-row items-center"
                      >
                        <Staff size={24} />
                        <h6 className="pl-3">Staff</h6>
                      </Link>
                    </li>
                  </ul>
                </div>
              )}
              <li className="pt-3">
                <Link
                  href={"/breweries"}
                  className="flex flex-row items-center p-3"
                >
                  <Beer size={24} />
                  <h6 className="pl-3">Breweries</h6>
                </Link>
              </li>
              <li>
                <Link
                  href={"/settings"}
                  className="flex flex-row items-center p-3"
                >
                  <UserCircle size={24} />
                  <h6 className="pl-3">Account</h6>
                </Link>
              </li>
              <li>
                {breweries ? (
                  <button onClick={handleSignOut}>Sign Out</button>
                ) : (
                  <button onClick={() => signIn()}>Sign In</button>
                )}
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Menu Nav */}
      <div className=" lg:hidden btm-nav z-40 bg-primary text-background">
        <button
          className={
            isActive(`/breweries/${selectedBrewery?._id}`) ? "active" : ""
          }
        >
          <Link
            href={`/breweries/${selectedBrewery?._id}`}
            data-tip="Home"
            className="flex flex-col items-center text-xs"
          >
            <Home
              size={24}
              strokeWidth={1}
              className={
                isActive(`/breweries/${selectedBrewery?._id}`)
                  ? "fill-accent text-primary"
                  : ""
              }
            />
            Home
          </Link>
        </button>
        <button className={isActive("/breweries") ? "active" : ""}>
          <Link
            href={"/breweries"}
            className="flex flex-col items-center text-xs"
            data-tip="Breweries"
          >
            <Factory
              size={24}
              strokeWidth={1}
              className={
                isActive("/breweries") ? "fill-accent text-primary" : ""
              }
            />
            Breweries
          </Link>
        </button>
        {adminAllowed ? (
          <>
            <button
              className={
                isActive(`/breweries/${selectedBrewery?._id}/categories`)
                  ? "active"
                  : ""
              }
            >
              <Link
                href={`/breweries/${selectedBrewery?._id}/categories`}
                className="flex flex-col items-center text-xs"
                data-tip="Brewery Categories Management"
              >
                <LayoutGrid
                  size={24}
                  strokeWidth={1}
                  className={
                    isActive(`/breweries/${selectedBrewery?._id}/categories`)
                      ? "fill-accent  text-accent"
                      : ""
                  }
                />
                Categories
              </Link>
            </button>
            <button
              className={
                isActive(`/breweries/${selectedBrewery?._id}/staff`)
                  ? "active"
                  : ""
              }
            >
              <Link
                href={`/breweries/${selectedBrewery?._id}/staff`}
                className="flex flex-col items-center text-xs"
                data-tip="Brewery Staff Management"
              >
                <Staff
                  size={24}
                  strokeWidth={1}
                  className={
                    isActive(`/breweries/${selectedBrewery?._id}/staff`)
                      ? "fill-accent  text-accent"
                      : ""
                  }
                />
                Staff
              </Link>
            </button>
          </>
        ) : null}
        <button className={isActive(`/settings`) ? "active" : ""}>
          <Link
            href={`/settings`}
            className="flex flex-col items-center text-xs"
            data-tip="You"
          >
            <Skull
              size={24}
              strokeWidth={1}
              color={isActive(`/settings`) ? "#1cdcbc" : "#fff"}
              // className={
              //   isActive(`/settings`) ? "fill-accent  text-primary" : ""
              // }
            />
            You
          </Link>
        </button>
      </div>
    </>
  );
};

export default NavBar;
