"use client";
import React, { useRef, useState } from "react";
import { useOnClickOutside } from "usehooks-ts";
import cn from "classnames";

type Props = {
  viewFilter: string;
  setViewFilter: React.Dispatch<React.SetStateAction<string>>;
};

const StaffDashboard = ({ viewFilter, setViewFilter }: Props) => {
  const menuButtons = ["All Staff", "Admin", "Crew"];

  return (
    <>
      {/* Large screen side dashboard menu */}
      <div className="dashboard-container ">
        {menuButtons.map((button) => (
          <button
            key={button}
            className={` text-sm md:text-base border border-stone-400 py-4 px-8 font-semibold  first:rounded-l-full last:rounded-r-full hover:border-black  justify-center shadow-xl ${
              viewFilter === button ? "dashboard-button__selected" : ""
            }`}
            onClick={() => setViewFilter(button)}
          >
            {button}
          </button>
        ))}
      </div>
    </>
  );
};

export default StaffDashboard;
