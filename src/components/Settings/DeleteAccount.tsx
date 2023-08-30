"use client";
import React from "react";
import DeleteOrRemoveButton from "../Buttons/DeleteOrRemoveButton";

type Props = {};

// Components created to use on setting page and use reuseable DeleteOrRemoveButton component
const DeleteAccount = (props: Props) => {
  return (
    <DeleteOrRemoveButton
      onClick={() => console.log("Delete Account")}
      buttonClassName="btn btn-error btn-outline"
      title="Delete Account"
      description="Permanently delete account and all breweries you own."
      descriptionClassName="mx-1 text-sm opacity-50"
    />
  );
};

export default DeleteAccount;
