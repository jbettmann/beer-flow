"use client";
import { useBreweryContext } from "@/context/brewery-beer";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import StaffDashboard from "./StaffDashboard";
import StaffTable from "./StaffTable";
import Link from "next/link";
import { Plus, UserPlus } from "lucide-react";
import BottomDrawer from "../Drawers/BottomDrawer";
import MultipleInvites from "../Invite/MultipuleInvites";
import { Users } from "@/app/types/users";
import EditModal from "../Alerts/EditModal";
import { debounce } from "@/lib/utils";

type Props = {};

const StaffContainer = (props: Props) => {
  const { selectedBrewery } = useBreweryContext();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [viewFilter, setViewFilter] = useState<string>("All Staff");

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
    };

    const debouncedResize = debounce(handleResize, 250); // 250ms delay

    window.addEventListener("resize", debouncedResize);

    return () => {
      window.removeEventListener("resize", debouncedResize);
    };
  }, []);

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
        <div className="fixed right-5 bottom-10 p-1 z-[2] lg:hidden ">
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
        {isMobile ? (
          <BottomDrawer isOpen={isOpen}>
            <MultipleInvites
              breweryId={selectedBrewery._id}
              setIsOpen={setIsOpen}
            />
          </BottomDrawer>
        ) : (
          <EditModal isOpen={isOpen} title="Invite">
            <MultipleInvites
              breweryId={selectedBrewery._id}
              setIsOpen={setIsOpen}
            />
          </EditModal>
        )}
      </>
    )
  );
};

export default StaffContainer;
