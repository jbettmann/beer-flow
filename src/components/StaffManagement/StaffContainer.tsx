"use client";
import { useBreweryContext } from "@/context/brewery-beer";
import { useSession } from "next-auth/react";
import React, { useState } from "react";
import StaffDashboard from "./StaffDashboard";
import StaffTable from "./StaffTable";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import BottomDrawer from "../Drawers/BottomDrawer";
import MultipleInvites from "../Invite/MultipuleInvites";

type Props = {};

const StaffContainer = (props: Props) => {
  const { selectedBrewery } = useBreweryContext();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [viewFilter, setViewFilter] = useState<string>("All Staff");

  return (
    selectedBrewery?.staff && (
      <>
        <div className="flex justify-between p-5">
          <div className="flex flex-col w-fit">
            <h3 className="text-left">{selectedBrewery.companyName} Staff</h3>
            <div className="text-sm badge badge-ghost opacity-50 mt-2">
              Owner {selectedBrewery.owner.fullName || ""}
            </div>
          </div>
          <button onClick={() => setIsOpen(true)} className="btn btn-accent">
            Invite <UserPlus size={20} />
          </button>
        </div>
        <div className="flex flex-col w-full lg:flex-row p-5">
          <StaffDashboard
            setViewFilter={setViewFilter}
            viewFilter={viewFilter}
          />
          <StaffTable viewFilter={viewFilter} brewery={selectedBrewery} />
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
