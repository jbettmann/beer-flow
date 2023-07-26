"use client";
import { Beer } from "@/app/types/beer";
import deleteBeers from "@/lib/DELETE/deleteBeers";
import { deleteImage } from "@/lib/supabase/deleteImage";
import { useRouter } from "next/navigation";
import React from "react";

type Props = {
  isSubmitting: React.MutableRefObject<boolean>;

  handleDelete: () => void;
};

const DeleteBeerButton = ({ isSubmitting, handleDelete }: Props) => {
  return (
    <button
      className="btn btn-outline btn-error"
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
