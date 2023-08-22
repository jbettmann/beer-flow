"use client";
import { Brewery } from "@/app/types/brewery";
import { Users } from "@/app/types/users";
import { useBreweryContext } from "@/context/brewery-beer";
import { signIn, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import ImageDisplay from "./ImageDisplay/ImageDisplay";
import {
  Settings,
  PlusCircle,
  HelpCircle,
  UserCircle,
  ListFilter,
  Users as Staff,
  Beer,
  Factory,
} from "lucide-react";
import { Session } from "next-auth";
import { set } from "mongoose";
import { usePathname, useRouter } from "next/navigation";

const NavBar = ({
  breweries,
  user,
}: {
  breweries: Brewery[];
  user: Session;
}) => {
  const { selectedBrewery, setSelectedBrewery } = useBreweryContext();
  const [adminAllowed, setAdminAllowed] = useState(false);
  const [open, setOpen] = useState(false);

  // Reference to the drawer div
  const drawerRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();

  const isActive = (path: string) => {
    console.log(pathname, path);
    return pathname === path;
  };

  const isUserAdmin = (brewery: Brewery, userId: string) => {
    if (brewery.admin) {
      if (typeof brewery.admin[0] === "string") {
        return brewery.admin.includes(userId);
      } else if (typeof brewery.admin[0] === "object") {
        return brewery.admin.some((admin) => admin._id === userId);
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
    setOpen(false);
  };

  // create default mark for brewery with no image/logo
  function getInitials(name: string) {
    // Exclude any signs like &,$,/,@,$
    name = name.replace(/[&$/@]/g, "");

    const words = name.split(" ");
    // Filter out the words you want to exclude
    const filteredWords = words.filter(
      (word) =>
        !["at", "the", "and", "of", "to", ""].includes(word.toLowerCase())
    );

    // If there are two or more words, return the first letter of the first two words
    if (filteredWords.length >= 2) {
      return (
        filteredWords[0][0].toUpperCase() + filteredWords[1][0].toUpperCase()
      );
    } else {
      return filteredWords[0][0].toUpperCase();
    }
  }

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

    // Function to handle outside click
    function handleClickOutside(event: MouseEvent) {
      if (
        drawerRef.current &&
        !drawerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    // Add the outside click handler
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup function
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
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
      <div className="navbar justify-between">
        <div className="drawer w-fit p-3">
          <input id="menu-drawer" type="checkbox" className="drawer-toggle" />
          <div className={`flex flex-row justify-between drawer-content`}>
            <div className="text-xl font-medium" ref={drawerRef}>
              <label
                htmlFor="menu-drawer"
                className="drawer-button flex flex-row items-center"
              >
                {selectedBrewery?.image ? (
                  <ImageDisplay item={selectedBrewery} className="logo" />
                ) : (
                  selectedBrewery?.companyName && (
                    <div className="logo logo__default ">
                      {getInitials(selectedBrewery.companyName || "")}
                    </div>
                  )
                )}
                <h6 className="pl-3 text-sm">{selectedBrewery?.companyName}</h6>
              </label>
            </div>
          </div>
          <div className="drawer-side z-10 ">
            <label htmlFor="menu-drawer" className="drawer-overlay "></label>
            <div className="h-full flex flex-col justify-between bg-base-200">
              <div className="menu p-4 w-80 h-full">
                {breweries.map((brewery: Brewery) => (
                  <li key={brewery._id}>
                    <Link
                      key={brewery._id}
                      href={`/breweries/${brewery._id}`}
                      className="flex flex-row"
                      onClick={(e) => {
                        handleBreweryClick(brewery);
                      }}
                    >
                      {brewery.image ? (
                        <ImageDisplay item={brewery} className="logo" />
                      ) : (
                        <div className="logo logo__default">
                          {getInitials(brewery.companyName)}
                        </div>
                      )}
                      <h6 className="pl-3">{brewery.companyName}</h6>
                    </Link>
                  </li>
                ))}
              </div>
              <div className="flex flex-col justify-center border-t-2 p-3 menu">
                <li>
                  {" "}
                  <Link
                    href={"/create/brewery"}
                    className="  flex flex-row items-center"
                  >
                    <PlusCircle size={24} />
                    <h6 className="pl-3">Create Brewery</h6>
                  </Link>
                </li>

                <li>
                  <Link
                    href={"/settings"}
                    className="  flex flex-row items-center"
                  >
                    <Settings size={24} />
                    <h6 className="pl-3">Settings</h6>
                  </Link>
                </li>

                <li>
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
          {" "}
          {selectedBrewery?.image ? (
            <ImageDisplay item={selectedBrewery} className="logo" />
          ) : (
            selectedBrewery?.companyName && (
              <div className="logo logo__default ">
                {getInitials(selectedBrewery.companyName || "")}
              </div>
            )
          )}
        </Link>
        <div className="flex-none gap-2">
          <div className="form-control">
            <input
              type="text"
              placeholder="Search"
              className="input input-bordered w-24 md:w-auto"
            />
          </div>
          <div className="dropdown dropdown-end ">
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
              className="mt-3 z-[1] p-2 shadow menu menu-md dropdown-content bg-base-100 min-w-max w-56 rounded-box "
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
                        <ListFilter size={24} />
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
                  href={"/account"}
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
      <div className=" lg:hidden btm-nav z-40">
        <button
          className={
            isActive(`/breweries/${selectedBrewery?._id}`) ? "active" : ""
          }
        >
          <Link
            href={`/breweries/${selectedBrewery?._id}`}
            data-tip="Home"
            className="flex flex-col items-center text-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Home
          </Link>
        </button>
        <button className={isActive("/breweries") ? "active" : ""}>
          <Link
            href={"/breweries"}
            className="flex flex-col items-center text-sm"
            data-tip="Breweries"
          >
            <Factory size={20} />
            Breweries
          </Link>
        </button>
        {adminAllowed && (
          <button
            className={
              isActive(`/breweries/${selectedBrewery?._id}/invite`)
                ? "active"
                : ""
            }
          >
            <Link
              href={`/breweries/${selectedBrewery?._id}/invite`}
              className="flex flex-col items-center text-sm"
              data-tip="Invite New Staff"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              Invite
            </Link>
          </button>
        )}
      </div>
    </>
  );
};

export default NavBar;
