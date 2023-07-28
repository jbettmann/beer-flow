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
    <div className="flex justify-centeritems-center">
      <div className="text-center relative">
        <input
          type="email"
          placeholder="Email"
          className={`${className} form__input mb-6 `}
          value={invitee.email}
          onChange={(e) => handleChange("email", e.target.value)}
        />
        {error && <p className="error absolute right-12 top-9 ">{error}</p>}
      </div>

      <div className="flex justify-center items-center pb-7">
        <input
          type="checkbox"
          checked={invitee.isAdmin}
          onChange={(e) => handleChange("isAdmin", e.target.checked)}
        />
        <label className="text-white ml-2">Admin?</label>
      </div>
    </div>
  );
};

export default Invite;
