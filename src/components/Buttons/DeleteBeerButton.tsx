"use client";
import { Beer } from "@/app/types/beer";
import deleteBeers from "@/lib/DELETE/deleteBeers";
import { deleteImage } from "@/lib/supabase/deleteImage";
import { useRouter } from "next/navigation";
import React from "react";

type Props = {
  isSubmitting: React.MutableRefObject<boolean>;
  beer: Beer;
  breweryId: string;
  token: string;
  mutate: () => void;
};

const DeleteBeerButton = ({
  isSubmitting,
  beer,
  breweryId,
  token,
  mutate,
}: Props) => {
  const router = useRouter();
  // Handle deleting beer
  const handleDelete = async () => {
    const result = confirm(
      "Are you sure you want to delete this beer? This action cannot be undone."
    );
    try {
      if (result) {
        isSubmitting.current = true;

        const deletedBeer = await deleteBeers({
          beerId: beer?._id,
          breweryId: breweryId,
          token: token,
        });
        if (deletedBeer) {
          await deleteImage(beer?.image);
          // forced revalidation of the beers
          mutate();
          router.back();
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      isSubmitting.current = false;
    }
  };
  return (
    <button
      className="btn btn-outline btn-error"
      disabled={isSubmitting.current}
      type="button"
      onClick={handleDelete}
    >
      Delete
    </button>
  );
};

export default DeleteBeerButton;
