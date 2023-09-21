"use client";
import React, { Dispatch, SetStateAction, useState } from "react";

type Props = {
  viewFilter: string;
  setViewFilter: Dispatch<SetStateAction<string>>;
};

const CategoryDashboard = ({ viewFilter, setViewFilter }: Props) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  console.log(isOpen);
  const menuButtons = ["All", "Empty"];
  return (
    <>
      {/* Large screen side dashboard menu */}
      <div className="hidden lg:flex-initial dashboard__container  py-7 px-1 lg:w-fit lg:h-[65vh] lg:card">
        {menuButtons.map((button, i) => (
          <button
            key={i}
            className={`btn btn-ghost rounded-sm hover:bg-the-gray hover:text-accent justify-center ${
              viewFilter === button ? "bg-the-gray  text-accent" : ""
            }`}
            onClick={() => setViewFilter(button)}
          >
            {button}
          </button>
        ))}
      </div>

      {/* Small screen dropdown menu */}
      <div
        className={`lg:hidden flex-initial card dashboard__container w-full z-[1] lg:z-0  dropdown ${
          isOpen ? "dropdown-open" : ""
        } ml-3`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <label className="btn btn-ghost w-full">{viewFilter}</label>
        <ul
          className={`dropdown-content menu p-2 shadow bg-fourth-color rounded-box w-full`}
        >
          {menuButtons.map((button, i) => (
            <li key={i}>
              <button
                className="btn btn-ghost "
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(!isOpen);
                  setViewFilter(button);
                }}
              >
                {button}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default CategoryDashboard;
