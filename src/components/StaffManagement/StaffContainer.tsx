"use client";
import { useBreweryContext } from "@/context/brewery-beer";
import { useSession } from "next-auth/react";
import React, { useState } from "react";
import StaffDashboard from "./StaffDashboard";
import StaffTable from "./StaffTable";
import Link from "next/link";
import { Plus, UserPlus } from "lucide-react";
import BottomDrawer from "../Drawers/BottomDrawer";
import MultipleInvites from "../Invite/MultipuleInvites";
import { Users } from "@/app/types/users";

type Props = {};

const StaffContainer = (props: Props) => {
  const { selectedBrewery } = useBreweryContext();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [viewFilter, setViewFilter] = useState<string>("All Staff");

  return (
    selectedBrewery?.staff && (
      <>
        <div className="flex justify-between md:p-5">
          <div className="flex flex-col w-fit mx-auto lg:m-0 lg:my-auto ">
            <h3 className="text-center lg:text-left">
              {selectedBrewery.companyName} Staff
            </h3>
            <div className="text-sm badge opacity-50 mt-2">
              Owner {(selectedBrewery.owner as Users).fullName || ""}
            </div>
          </div>
          <div className="hidden lg:block">
            <button onClick={() => setIsOpen(true)} className="create-btn">
              Invite <UserPlus size={20} />
            </button>
          </div>
        </div>
        {/* Small Screen New Category Button */}
        <div className="fixed right-5 bottom-20 p-1 z-[2] lg:hidden ">
          <button
            onClick={() => setIsOpen(true)}
            className="btn btn-circle btn-white create-btn !btn-lg"
          >
            <Plus size={28} />
          </button>
        </div>

        {/* Layout */}
        <div className="flex flex-col w-full  md:p-5">
          <StaffDashboard
            setViewFilter={setViewFilter}
            viewFilter={viewFilter}
          />

          <StaffTable
            viewFilter={viewFilter}
            brewery={selectedBrewery}
            setIsOpen={setIsOpen}
          />
        </div>
        <BottomDrawer isOpen={isOpen}>
          <MultipleInvites
            breweryId={selectedBrewery._id}
            setIsOpen={setIsOpen}
          />
        </BottomDrawer>
      </>
    )
  );
};

export default StaffContainer;
