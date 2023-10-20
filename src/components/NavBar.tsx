"use client";
import { Brewery } from "@/app/types/brewery";
import { useBreweryContext } from "@/context/brewery-beer";
import { getInitials } from "@/lib/utils";
import {
  AlignJustify,
  Beer,
  Factory,
  FactoryIcon,
  HelpCircle,
  Home,
  HomeIcon,
  LayoutGrid,
  LogOut,
  PlusCircle,
  Search as SearchIcon,
  Settings,
  Shield,
  ShieldBan,
  Skull,
  Users as Staff,
  User2,
  UserCircle,
} from "lucide-react";
import { Session, User } from "next-auth";
import { signIn, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import SideDrawer from "./Drawers/SideDrawer";
import ImageDisplay from "./ImageDisplay/ImageDisplay";
import { Search } from "./Search/Search";
import { Users } from "@/app/types/users";

const NavBar = ({ breweries, user }: { breweries: Brewery[]; user: any }) => {
  const { selectedBrewery, setSelectedBrewery } = useBreweryContext();
  const [adminAllowed, setAdminAllowed] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Reference to the drawer div

  const breweryMenuRef = useRef<any>(null);
  const checkBoxRef = useRef<HTMLInputElement>(null);

  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  const closeDrawer = () => {
    checkBoxRef.current?.click();
  };

  const closeBreweryMenu = () => {
    breweryMenuRef.current?.click();
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

  useEffect(() => {
    const handleScroll = () => {
      // If scrolled down, set isScrolled to true, otherwise false
      setIsScrolled(window.scrollY > 10);
    };

    // Attach the scroll event listener
    window.addEventListener("scroll", handleScroll);
    return () => {
      // Cleanup the event listener on component unmount
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

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
      const isAdmin = isUserAdmin(selectedBrewery, user?.id || "");
      const isOwner = isUserOwner(selectedBrewery, user?.id || "");

      setAdminAllowed(isAdmin || isOwner);
    }
  }, [selectedBrewery]);

  return (
    <>
      <SideDrawer isOpen={isSearchOpen}>
        <Search isOpen={isSearchOpen} setIsOpen={setIsSearchOpen} />
      </SideDrawer>

      {/* Drawer for small screens */}
      <div
        className={`drawer w-full md:hidden fixed right-0 left-0 top-0 py-5 px-6 bg-background text-primary z-10 transition-all ${
          isScrolled ? "shadow-lg" : ""
        }`}
      >
        <input
          id="menu-drawer"
          type="checkbox"
          className="drawer-toggle"
          ref={checkBoxRef}
        />
        <div className={`flex flex-row justify-between drawer-content gap-6`}>
          <label
            htmlFor="menu-drawer"
            className="drawer-button flex flex-row items-center"
          >
            <AlignJustify />
          </label>

          <Link
            href={`/breweries/${selectedBrewery?._id}`}
            className="flex flex-row items-center justify-center gap-1"
          >
            {selectedBrewery?.image ? (
              <ImageDisplay item={selectedBrewery} className="logo w-8 h-8" />
            ) : (
              selectedBrewery?.companyName && (
                <div className=" logo__default !text-base ">
                  {getInitials(selectedBrewery.companyName || "")}
                </div>
              )
            )}
            <h6 className="text-xs">{selectedBrewery?.companyName}</h6>
          </Link>
          <div className="flex-none gap-2">
            <div
              className="form-control relative"
              onClick={() => setIsSearchOpen(true)}
            >
              <SearchIcon size={24} strokeWidth={2} />
            </div>
          </div>
        </div>

        <div className="drawer-side z-50 text-background">
          <label htmlFor="menu-drawer" className="drawer-overlay "></label>
          <div className="h-full flex flex-col justify-between menu-drawer w-9/12 xxs:w-auto">
            <div className="p-6">
              <h4 className="py-4">Breweries</h4>
              <ul className="w-full menu !flex-nowrap  h-full gap-3 overflow-y-scroll">
                {breweries.map((brewery: Brewery) => (
                  <li
                    key={brewery._id}
                    className="category-card rounded-xl p-1"
                  >
                    <Link
                      key={brewery._id}
                      href={`/breweries/${brewery._id}`}
                      className="flex flex-col xs:flex-row items-center text-left "
                      onClick={() => handleBreweryClick(brewery)}
                    >
                      {brewery.image ? (
                        <ImageDisplay
                          item={brewery}
                          className="logo w-10 h-10"
                        />
                      ) : (
                        <div className="logo__default !p-2 !text-base">
                          {getInitials(brewery.companyName)}
                        </div>
                      )}
                      <h6 className="pl-1 text-left text-xs">
                        {brewery.companyName}
                      </h6>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            {adminAllowed && (
              <>
                <div className="divider-horizontal border !border-background/20 w-full !ml-0"></div>
                <div className="flex flex-col justify-center  p-3 px-6 menu">
                  <div
                    className="opacity-80 flex flex-row items-center"
                    data-tip={`${selectedBrewery?.companyName} Management`}
                    title={`${selectedBrewery?.companyName} Management`}
                  >
                    {selectedBrewery?.image
                      ? selectedBrewery.image && (
                          <ImageDisplay
                            item={selectedBrewery}
                            className="logo !w-6 !h-6"
                          />
                        )
                      : selectedBrewery?.companyName && (
                          <div className="logo__default !text-base">
                            {getInitials(
                              selectedBrewery?.companyName as string
                            )}
                          </div>
                        )}
                    <p>{selectedBrewery?.companyName} Management</p>
                  </div>
                  <li onClick={closeDrawer}>
                    <Link
                      href={`/breweries/${selectedBrewery?._id}/categories`}
                      className="flex flex-row items-center "
                      data-tip={`Categories Management`}
                    >
                      <LayoutGrid size={22} strokeWidth={1} />
                      <h6 className="pl-3">Category Management</h6>
                    </Link>
                  </li>
                  <li onClick={closeDrawer}>
                    <Link
                      href={`/breweries/${selectedBrewery?._id}/staff`}
                      className="flex flex-row items-center"
                      data-tip="Staff Management"
                    >
                      <Staff size={22} strokeWidth={1} />
                      <h6 className="pl-3">Staff Management</h6>
                    </Link>
                  </li>
                </div>
              </>
            )}
            <div className="divider-horizontal border !border-background/20 w-full !ml-0"></div>
            <div className="flex flex-col justify-center  p-3 menu">
              <li onClick={closeDrawer}>
                <Link
                  href={"/settings"}
                  className="flex flex-row items-center"
                  data-tip="Settings"
                >
                  <Settings size={22} strokeWidth={1} />
                  <h6 className="pl-3">Settings</h6>
                </Link>
              </li>

              <li onClick={closeDrawer}>
                <Link
                  href={"/help"}
                  className=" flex flex-row items-center"
                  data-tip="Help"
                >
                  <HelpCircle size={22} strokeWidth={1} />
                  <h6 className="pl-3">Help</h6>
                </Link>
              </li>
              <li>
                {breweries ? (
                  <button
                    className=" flex flex-row items-center text-accent"
                    onClick={handleSignOut}
                    aria-label="Sign Out"
                    data-tip="Sign Out"
                  >
                    <LogOut size={22} strokeWidth={1} />
                    <h6 className="pl-3">Sign Out</h6>
                  </button>
                ) : (
                  <button
                    className=" flex flex-row items-center"
                    onClick={() => signIn()}
                    aria-label="Sign In"
                    data-tip="Sign In"
                  >
                    <h6 className="pl-3">Sign In</h6>
                  </button>
                )}
              </li>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard horizontal DESKTOP */}
      <div className="hidden md:flex md:fixed top-0 right-0 left-0 px-4 pl-12 py-2  w-full justify-between items-center bg-primary text-background z-[1] ">
        <ul className="menu menu-horizontal text-xs pounded-box pl-8 py-0">
          <li>
            <details>
              <summary className="py-0 hover:text-accent" ref={breweryMenuRef}>
                {selectedBrewery?.image
                  ? selectedBrewery.image && (
                      <ImageDisplay
                        item={selectedBrewery}
                        className="logo !w-6 !h-6"
                      />
                    )
                  : selectedBrewery?.companyName && (
                      <div className="logo__default  !text-base">
                        {getInitials(selectedBrewery?.companyName as string)}
                      </div>
                    )}
                {selectedBrewery?.companyName}
              </summary>
              <ul className="space-y-4">
                {breweries.map((brewery: Brewery) => (
                  <li
                    key={brewery._id}
                    className="category-card rounded-xl p-2 "
                  >
                    <Link
                      href={`/breweries/${brewery._id}`}
                      key={brewery._id}
                      className="flex flex-row items-center text-left"
                      onClick={() => {
                        handleBreweryClick(brewery);
                        closeBreweryMenu();
                      }}
                    >
                      {brewery.image
                        ? brewery.image && (
                            <ImageDisplay
                              item={brewery}
                              className="logo w-9 h-9"
                            />
                          )
                        : brewery.companyName && (
                            <div className="logo__default !p-2 !text-base ">
                              {getInitials(brewery.companyName)}
                            </div>
                          )}
                      <h6 className="pl-3 text-left text-xs">
                        {brewery.companyName}
                      </h6>
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          </li>
        </ul>
        {/* Profile Photo with Option Dropdown */}
        <div className="flex dropdown dropdown-left">
          <label
            tabIndex={0}
            className="btn btn-ghost btn-circle btn-sm justify-center items-center"
          >
            <Image
              src={user?.picture}
              alt={`profile picture of ${user?.name}`}
              className="rounded-full my-auto avatar justify-center items-center"
              width={50}
              height={50}
            />
          </label>
          <ul
            tabIndex={0}
            className="mt-3 z-[1] p-2 shadow menu menu-md dropdown-content bg-base-100 text-primary rounded-box p-3 "
          >
            <li>
              <Link
                href={"/breweries"}
                className="flex flex-row items-center p-3"
              >
                <Beer size={24} strokeWidth={1} />
                <h6 className="pl-3">Breweries</h6>
              </Link>
            </li>
            <li>
              <Link
                href={"/settings"}
                className="flex flex-row items-center p-3"
              >
                <ShieldBan size={24} strokeWidth={1} />
                <h6 className="pl-3">Account</h6>
              </Link>
            </li>
            <li>
              {breweries ? (
                <button
                  onClick={handleSignOut}
                  className="flex flex-row items-center p-3"
                >
                  <LogOut size={18} strokeWidth={1} />
                  <h6 className="pl-3">Sign Out</h6>
                </button>
              ) : (
                <button onClick={() => signIn()}>Sign In</button>
              )}
            </li>
          </ul>
        </div>
      </div>
      {/* Dashboard vertical large screen */}
      <div className="hidden md:flex md:fixed left-0 top-0 p-4 h-full flex-col justify-between items-center bg-primary text-background z-[1]">
        <div>
          <div className="flex flex-col justify-center items-center space-y-6">
            <Link href={`/breweries`}>
              <h1>B</h1>
            </Link>
            <Link
              href={`/breweries/${selectedBrewery?._id}`}
              className={`flex flex-row justify-between  tooltip tooltip-accent tooltip-right`}
              data-tip="Home"
            >
              <HomeIcon size={22} strokeWidth={1} />
            </Link>
            <div className="divider-horizontal border !border-background/20 w-full"></div>
          </div>
          <div className="flex flex-col justify-center items-center space-y-6 mt-6">
            {adminAllowed && (
              <>
                <div
                  className="opacity-80"
                  data-tip={`${selectedBrewery?.companyName} Management`}
                  title={`${selectedBrewery?.companyName} Management`}
                >
                  {selectedBrewery?.image
                    ? selectedBrewery.image && (
                        <ImageDisplay
                          item={selectedBrewery}
                          className="logo w-7 h-7"
                        />
                      )
                    : selectedBrewery?.companyName && (
                        <div className="logo__default !text-base">
                          {getInitials(selectedBrewery?.companyName as string)}
                        </div>
                      )}
                </div>
                <Link
                  href={`/breweries/${selectedBrewery?._id}/categories`}
                  className="flex flex-row items-center  tooltip tooltip-accent tooltip-right"
                  data-tip={`Categories Management`}
                >
                  <LayoutGrid size={22} strokeWidth={1} />
                </Link>

                <Link
                  href={`/breweries/${selectedBrewery?._id}/staff`}
                  className="flex flex-row items-center tooltip tooltip-accent tooltip-right"
                  data-tip="Staff Management"
                >
                  <Staff size={22} strokeWidth={1} />
                </Link>

                <div className="divider-horizontal border !border-background/20 w-full"></div>
              </>
            )}
          </div>
        </div>
        <div>
          <div className="flex flex-col justify-center items-center space-y-6">
            <div className="divider-horizontal border !border-background/20 w-full"></div>

            <Link
              href={"/settings"}
              className="  flex flex-row items-center tooltip tooltip-accent tooltip-right"
              data-tip="Settings"
            >
              <Settings size={22} strokeWidth={1} />
            </Link>

            <Link
              href={"/help"}
              className=" flex flex-row items-center tooltip tooltip-accent tooltip-right"
              data-tip="Help"
            >
              <HelpCircle size={22} strokeWidth={1} />
            </Link>
            <div className="divider-horizontal border !border-background/20 w-full"></div>
          </div>
          <div className="flex flex-col justify-center items-center space-y-6 mt-6">
            <div
              className="form-control relative hover:cursor-pointer tooltip tooltip-accent tooltip-right"
              data-tip="Search"
              onClick={() => setIsSearchOpen(true)}
            >
              <SearchIcon size={22} strokeWidth={1} />
            </div>
            {/* Profile Photo with Option Dropdown */}
            <div
              className="hidden md:block dropdown dropdown-top "
              data-tip="Option Menu"
            >
              <label
                tabIndex={0}
                className="btn btn-ghost btn-circle btn-sm avatar"
              >
                <User2 size={22} strokeWidth={1} />
              </label>
              <ul
                tabIndex={0}
                className="mt-3 z-20 shadow menu menu-sm dropdown-content  bg-base-100 text-primary min-w-max w-fit justify-end rounded-box p-3 "
              >
                <li>
                  <Link
                    href={"/settings/profile"}
                    className="flex flex-row items-center p-3"
                  >
                    <UserCircle size={18} strokeWidth={1} />
                    <h6 className="pl-3">Profile</h6>
                  </Link>
                </li>
                <li>
                  {breweries ? (
                    <button
                      className=" flex flex-row items-center p-3 text-primary"
                      onClick={handleSignOut}
                    >
                      <LogOut size={18} strokeWidth={1} />
                      <h6 className="pl-3">Sign Out</h6>
                    </button>
                  ) : (
                    <button
                      className=" flex flex-row items-center p-3"
                      onClick={() => signIn()}
                    >
                      <h6 className="pl-3">Sign In</h6>
                    </button>
                  )}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Menu Nav */}
      {/* <div className=" md:hidden btm-nav z-40 bg-primary text-background">
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
      </div> */}
    </>
  );
};

export default NavBar;
