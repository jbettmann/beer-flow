"use client";
import React, {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { useOnClickOutside } from "usehooks-ts";
import cn from "classnames";
type Props = {
  viewFilter: string;
  setViewFilter: Dispatch<SetStateAction<string>>;
};

const CategoryDashboard = ({ viewFilter, setViewFilter }: Props) => {
  const menuButtons = ["All", "Empty"];

  return (
    <>
      {/* Large screen side dashboard menu */}
      <div className="dashboard-container ">
        {menuButtons.map((button, i) => (
          <button
            key={i}
            className={` dashboard-button first:px-12 ${
              viewFilter === button ? "dashboard-button__selected " : ""
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

export default CategoryDashboard;
