"use client";
import React from "react";

type Props = {
  isSubmitting: React.MutableRefObject<boolean>;

  handleDelete: () => void;
};

const DeleteBeerButton = ({ isSubmitting, handleDelete }: Props) => {
  return (
    <button
      className="btn btn-outline btn-error rounded-full"
      disabled={isSubmitting.current}
      type="button"
      onClick={handleDelete}
    >
      {!isSubmitting ? (
        <span className="loading loading-spinner text-accent"></span>
      ) : (
        "Delete"
      )}
    </button>
  );
};

export default DeleteBeerButton;
