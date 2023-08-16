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
} from "lucide-react";
import { Session } from "next-auth";

const NavBar = ({
  breweries,
  user,
}: {
  breweries: Brewery[];
  user: Session;
}) => {
  const { selectedBrewery, setSelectedBrewery } = useBreweryContext();
  const [adminAllowed, setAdminAllowed] = useState(
    selectedBrewery?.admin?.includes(user?.user.id)
  );
  const [open, setOpen] = useState(false);

  // Reference to the drawer div
  const drawerRef = useRef<HTMLDivElement>(null);

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
  // set user admin status
  useEffect(() => {
    if (selectedBrewery) {
      // Check if the user is the owner
      const isOwner = selectedBrewery.owner?._id === user?.user.id;

      if (selectedBrewery.admin) {
        if (typeof selectedBrewery.admin[0] === "string") {
          // If admin is an array of string IDs
          setAdminAllowed(
            isOwner || selectedBrewery.admin.includes(user?.user.id)
          );
        } else if (typeof selectedBrewery.admin[0] === "object") {
          // If admin is an array of objects
          setAdminAllowed(
            isOwner ||
              selectedBrewery.admin.some((admin) => admin._id === user?.user.id)
          );
        }
      }
    }
  }, [selectedBrewery]);

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

  return (
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
              <h3 className="pl-3 text-sm">{selectedBrewery?.companyName}</h3>
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
                    <h3 className="pl-3">{brewery.companyName}</h3>
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
                  <h3 className="pl-3">Create Brewery</h3>
                </Link>
              </li>

              <li>
                <Link
                  href={"/settings"}
                  className="  flex flex-row items-center"
                >
                  <Settings size={24} />
                  <h3 className="pl-3">Settings</h3>
                </Link>
              </li>

              <li>
                <Link href={"/help"} className=" flex flex-row items-center">
                  <HelpCircle size={24} />
                  <h3 className="pl-3">Help</h3>
                </Link>
              </li>
            </div>
          </div>
        </div>
      </div>
      <Link href={"/"}>Home</Link>
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
                      <h3 className="pl-3">Categories</h3>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={`/breweries/${selectedBrewery?._id}/staff`}
                      className="flex flex-row items-center"
                    >
                      <Staff size={24} />
                      <h3 className="pl-3">Staff</h3>
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
                <h3 className="pl-3">Breweries</h3>
              </Link>
            </li>
            <li>
              <Link
                href={"/account"}
                className="flex flex-row items-center p-3"
              >
                <UserCircle size={24} />
                <h3 className="pl-3">Account</h3>
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
  );
};

export default NavBar;
