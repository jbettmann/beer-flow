"use client";
import React from "react";

type Props = {
  viewFilter: string;
  setViewFilter: React.Dispatch<React.SetStateAction<string>>;
};

const CategoryDashboard = ({ viewFilter, setViewFilter }: Props) => {
  const menuButtons = ["All Categories", "Empty Categories"];
  return (
    <>
      {/* Large screen side dashboard menu */}
      <div className="hidden lg:flex-initial lg:w-48 lg:h-[65vh] lg:card bg-third-color lg:shadow-md lg:space-y-2">
        {menuButtons.map((button, i) => (
          <button
            key={i}
            className="btn btn-ghost justify-start"
            onClick={() => setViewFilter(button)}
          >
            {button}
          </button>
        ))}
      </div>

      {/* Small screen dropdown menu */}
      <div className="lg:hidden flex-initial w-48 z-[1] lg:z-0 card bg-third-color  shadow-md space-y-2 dropdown ml-3">
        <label className="btn btn-ghost w-full" tabIndex={0}>
          {viewFilter}
        </label>
        <ul
          tabIndex={0}
          className="dropdown-content menu p-2 shadow bg-fourth-color rounded-box w-52"
        >
          {menuButtons.map((button, i) => (
            <li key={i}>
              <button
                className="btn btn-ghost "
                onClick={() => setViewFilter(button)}
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
