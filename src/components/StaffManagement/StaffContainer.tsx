"use client";
import { useBreweryContext } from "@/context/brewery-beer";
import { useSession } from "next-auth/react";
import React, { useState } from "react";
import StaffDashboard from "./StaffDashboard";
import StaffTable from "./StaffTable";

type Props = {};

const StaffContainer = (props: Props) => {
  const { data: session } = useSession();
  const { selectedBrewery } = useBreweryContext();
  const [viewFilter, setViewFilter] = useState<string>("All Staff");
  console.log(session?.user);
  return (
    selectedBrewery?.staff && (
      <div className="flex flex-col w-full lg:flex-row">
        <StaffDashboard setViewFilter={setViewFilter} viewFilter={viewFilter} />
        <StaffTable viewFilter={viewFilter} brewery={selectedBrewery} />
      </div>
    )
  );
};

export default StaffContainer;
