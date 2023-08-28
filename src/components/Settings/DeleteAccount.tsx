"use client";
import React from "react";

type Props = {};

const DeleteAccount = (props: Props) => {
  return (
    <div>
      <button
        onClick={() => console.log("Delete Account")}
        className="btn btn-error btn-outline"
      >
        Delete Account
      </button>
      <p className="mx-1 text-sm opacity-50">
        Permanently delete account and all breweries you own.
      </p>
    </div>
  );
};

export default DeleteAccount;
