"use client";
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
    <div className="dropdown absolute right-5 top-0">
      <label tabIndex={0}>
        <button onClick={handleOptions} className={className}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="inline-block w-5 h-5 stroke-current"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
            ></path>
          </svg>
        </button>
      </label>

      <ul
        tabIndex={0}
        className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
      >
        {options.map((option, index) =>
          option.name === "Edit Category" ? (
            <Link
              key={index}
              href={option.href}
              className={`${option.disabled ? "disabled" : ""} py-2 `}
            >
              {option.name}
            </Link>
          ) : (
            <button
              key={index}
              onClick={option.onClick}
              disabled={option.disabled}
              className={`${option.disabled ? "disabled" : ""} py-2 `}
            >
              {option.name}
            </button>
          )
        )}
      </ul>
    </div>
  );
};

export default OptionsButton;
