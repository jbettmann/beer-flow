"use client";
import { Brewery } from "@/app/types/brewery";
import { Users } from "@/app/types/users";
import { useBreweryContext } from "@/context/brewery-beer";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { ChangeEvent, useEffect, useRef, useState } from "react";
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
  X,
  UserPlus,
  LayoutList,
  Home,
} from "lucide-react";
import { Session } from "next-auth";
import { set } from "mongoose";
import { usePathname, useRouter } from "next/navigation";
import getBreweryBeers from "@/lib/getBreweryBeers";
import useSWR from "swr";
import { getInitials } from "@/lib/utils";

const NavBar = ({
  breweries,
  user,
}: {
  breweries: Brewery[];
  user: Session;
}) => {
  const {
    selectedBeers,
    setSelectedBeers,
    selectedBrewery,
    setSelectedBrewery,
  } = useBreweryContext();
  const [adminAllowed, setAdminAllowed] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  // const { data: beers, error: beersError } = useSWR(
  //   [
  //     `https://beer-bible-api.vercel.app/breweries/${selectedBrewery?._id}/beers`,
  //     user?.user.accessToken,
  //   ],
  //   getBreweryBeers
  // );
  const originalSelectedBeers = useRef(selectedBeers);

  const debounceDelay = 300; // 300ms
  const debounceTimeout = useRef<number | undefined>();

  // Filter beers by search term
  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      if (!searchTerm) {
        setSelectedBeers(originalSelectedBeers.current);
        return;
      }

      const filteredBeers = originalSelectedBeers.current?.filter((beer) => {
        const { name, style, hops, malt } = beer;
        const searchStr = `${name} ${style} ${hops.join(" ")} ${malt.join(
          " "
        )}`.toLowerCase();
        return searchStr.includes(searchTerm.toLowerCase());
      });

      setSelectedBeers(filteredBeers);
    }, debounceDelay);

    // Clear timeout on unmount
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [searchTerm]);

  // Set the state original beer state when search is cleared
  useEffect(() => {
    originalSelectedBeers.current = selectedBeers;
  }, [selectedBrewery]);

  // Reference to the drawer div
  const drawerRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();

  const isActive = (path: string) => {
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
        <div className="drawer w-fit p-3 z-50">
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
            <div className="h-full flex flex-col justify-between menu-drawer">
              <div className="menu p-6 w-80 h-full">
                <h4 className="py-4">Breweries</h4>

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
          <div className="form-control relative">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input input-bordered w-24 md:w-auto"
            />
            {searchTerm && (
              <span
                className="absolute top-1/4 right-2 opacity-50 cursor-pointer"
                onClick={() => setSearchTerm("")}
              >
                <X size={20} />
              </span>
            )}
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

      {/* Bottom Menu Nav */}
      <div className=" lg:hidden btm-nav z-40 bg-third-color">
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
                <LayoutList
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
        <Link href={`/settings`}>
          <label tabIndex={0} className="btn btn-ghost avatar">
            <Image
              src={user.user.picture}
              alt={`profile picture of ${user.user.name}`}
              className="rounded-full"
              width={50}
              height={50}
            />
          </label>
        </Link>
      </div>
    </>
  );
};

export default NavBar;
