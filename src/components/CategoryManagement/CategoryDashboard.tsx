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
  const [isOpen, setIsOpen] = useState<boolean>(false);
  //close the dropdown when clicking outside the referenced element
  const ref = useRef<HTMLDivElement>(null);

  useOnClickOutside(ref, () => setIsOpen(false));

  //onclick handler when clicking a menu item
  const handleClick = () => {
    setIsOpen(false);
  };

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
        ref={ref}
        className={`lg:hidden flex-initial card dashboard__container w-full z-[2] lg:z-0 ${cn(
          {
            dropdown: true,
            "dropdown-open ": isOpen,
          }
        )}`}
      >
        <label
          tabIndex={0}
          className="btn btn-ghost w-full"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          {viewFilter}
        </label>
        <ul
          tabIndex={0}
          className={cn({
            "dropdown-content menu p-2 shadow rounded-box  bg-fourth-color w-full":
              true,
            hidden: !isOpen,
          })}
        >
          {menuButtons.map((button, i) => (
            <li key={i}>
              <button
                className={`btn btn-ghost content-center ${
                  viewFilter === button ? "bg-the-gray  text-accent" : ""
                } `}
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick();
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
