"use client";
import { Brewery } from "@/app/types/brewery";
import React from "react";

type Props = {
  brewery?: Brewery;
};

const RemoveAccess = ({ brewery }: Props) => {
  return (
    <div className="text-center">
      <button
        onClick={() => console.log("Remove Access")}
        className="btn btn-error btn-outline"
      >
        Remove Access
      </button>
      <p className="delete-remove-btn__text">
        This will remove your access to
        {brewery ? brewery.companyName : "this brewery"}.
      </p>
    </div>
  );
};

export default RemoveAccess;
