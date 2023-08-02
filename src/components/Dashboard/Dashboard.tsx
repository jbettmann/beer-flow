"use client";
import { Brewery } from "@/app/types/brewery";
import { useBreweryContext } from "@/context/brewery-beer";
import { Session } from "next-auth";
import Link from "next/link";
import React, { use, useEffect } from "react";

type Props = {
  breweries: Brewery[];
  user: Session;
};

const Dashboard = ({ breweries, user }: Props) => {
  const { selectedBrewery } = useBreweryContext();
  const [adminAllowed, setAdminAllowed] = React.useState(
    selectedBrewery?.admin?.includes(user?.user.id)
  );

  useEffect(() => {
    if (selectedBrewery && selectedBrewery.admin) {
      if (typeof selectedBrewery.admin[0] === "string") {
        // If admin is an array of string IDs
        setAdminAllowed(selectedBrewery.admin.includes(user?.user.id));
      } else if (typeof selectedBrewery.admin[0] === "object") {
        // If admin is an array of objects
        setAdminAllowed(
          selectedBrewery.admin.some((admin) => admin._id === user?.user.id)
        );
      }
    }
  }, [selectedBrewery]);

  console.log({ selectedBrewery, adminAllowed });

  return (
    <div className="fixed bottom-2 left-2 ">
      <ul className="menu bg-primary text-white rounded-box ">
        <li>
          <Link href={"/"} className="tooltip tooltip-right" data-tip="Home">
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
          </Link>
        </li>
        <li>
          <Link
            href={"/breweries"}
            className="tooltip tooltip-right"
            data-tip="Breweries"
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
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </Link>
        </li>
        {adminAllowed && (
          <li>
            <Link
              href={`/breweries/${selectedBrewery?._id}/invite`}
              className="tooltip tooltip-right"
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
            </Link>
          </li>
        )}
      </ul>
    </div>
  );
};

export default Dashboard;
