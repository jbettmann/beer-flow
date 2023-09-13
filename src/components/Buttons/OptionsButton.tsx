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
    <div className="dropdown dropdown-end absolute right-5 top-[10%]">
      <label tabIndex={0}>
        <button onClick={handleOptions} className={className}>
          <MoreHorizontal size={24} />
        </button>
      </label>

      <ul
        tabIndex={0}
        className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52 flex items-center"
      >
        {options.map(
          (option, index) =>
            option.name === "Edit Category" ? (
              <li key={index}>
                <Link
                  key={index}
                  href={option.href}
                  className={`${option.disabled ? "disabled" : ""} p-2 `}
                >
                  {option.name}
                </Link>
              </li>
            ) : null
          // <button
          //   key={index}
          //   onClick={option.onClick}
          //   disabled={option.disabled}
          //   className={`${option.disabled ? "disabled" : ""} py-2 `}
          // >
          //   {option.name}
          // </button>
        )}
      </ul>
    </div>
  );
};

export default OptionsButton;
