"use client";
import React from "react";

type Props = {
  invitee: { email: string; isAdmin: boolean; error: string };
  handleChange: (field: string, value: string | boolean) => void;
  className?: string;
  error: string;
};

const Invite = ({ invitee, handleChange, className, error }: Props) => {
  return (
    <div className="flex justify-center items-center mb-6">
      <div className="text-left flex relative">
        <div className="flex-1">
          <label htmlFor="email" className="label-text m-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            placeholder="Email"
            className={`${className} form__input w-full `}
            value={invitee.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />
          {error && <p className="error absolute right-12 top-9 ">{error}</p>}
        </div>
        <div className="flex-none px-3 text-center ">
          <label className="cursor-pointer label label-text text-primary ">
            Admin{" "}
          </label>
          <input
            type="checkbox"
            className="checkbox checkbox-accent"
            onChange={(e) => handleChange("isAdmin", e.target.checked)}
            checked={invitee.isAdmin}
          />
        </div>
      </div>
    </div>
  );
};

export default Invite;
