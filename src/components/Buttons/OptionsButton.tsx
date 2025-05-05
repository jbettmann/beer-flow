"use client";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import React from "react";

interface Options {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  href?: string;
  disabled: boolean;
  name: string;
}

type Props = {
  handleOptions: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className: string;
  options: Options[];
};

const OptionsButton = ({ handleOptions, className, options }: Props) => {
  return (
    <div className="dropdown dropdown-end absolute right-4 top-2">
      <label tabIndex={0}>
        <button onClick={handleOptions} className={`${className} btn-sm`}>
          <MoreHorizontal size={20} />
        </button>
      </label>

      <ul
        tabIndex={0}
        className="menu menu-sm dropdown-content z-1 p-2 shadow rounded-box w-[5.25rem] text-center  flex items-center justify-center bg-white text-primary"
      >
        {options.map((option, index) =>
          option.name === "Edit Name" ? (
            <li key={index} className="w-full text-center mx-auto">
              <button
                key={index}
                onClick={option.onClick}
                aria-label="Edit Category Name"
                className={`${option.disabled ? "disabled" : ""} p-1 w-full`}
              >
                <p className="w-full text-center mx-auto text-xs m-0">
                  {option.name}
                </p>
              </button>
            </li>
          ) : null
        )}
      </ul>
    </div>
  );
};

export default OptionsButton;
