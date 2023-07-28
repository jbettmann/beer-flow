"use client";
import React from "react";

type Props = {
  invitee: { email: string; admin: boolean };
  handleChange: (field: string, value: string | boolean) => void;
  className?: string;
};

const Invite = ({ invitee, handleChange, className }: Props) => {
  return (
    <div>
      <input
        type="email"
        placeholder="Email"
        className={`${className} form__input`}
        value={invitee.email}
        onChange={(e) => handleChange("email", e.target.value)}
      />
      <input
        type="checkbox"
        checked={invitee.admin}
        onChange={(e) => handleChange("admin", e.target.checked)}
      />
      <label className="text-white">Admin?</label>
    </div>
  );
};

export default Invite;
