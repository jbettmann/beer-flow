import { Brewery } from "@/app/types/brewery";
import { Save, X } from "lucide-react";
import React, { use, useEffect, useState } from "react";
import ImageDisplay from "../ImageDisplay/ImageDisplay";
import { getInitials } from "@/lib/utils";
import { updateImage } from "@/lib/supabase/updateImage";
import Image from "next/image";
import updateBreweryInfo from "@/lib/PUT/updateBreweryInfo";
import { useSession } from "next-auth/react";
import { useToast } from "@/context/toast";
import { useBreweryContext } from "@/context/brewery-beer";
import { set } from "mongoose";
import SaveButton from "../Buttons/SaveButton";
import useSWR from "swr";
import getSingleBrewery from "@/lib/getSingleBrewery";

type Props = {
  brewery: Brewery;
  onClose: () => void;
};

const EditBreweryProfile = ({ brewery, onClose }: Props) => {
  const { data: session } = useSession();
  const { addToast } = useToast();
  const { setSelectedBrewery } = useBreweryContext();
  const [isLoading, setIsLoading] = useState(false);
  const [editBrewery, setEditBrewery] = useState(brewery || {});
  const [companyName, setCompanyName] = useState(brewery.companyName || "");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [hasEdited, setHasEdited] = useState<boolean>(false);
  const [nameError, setNameError] = useState<string | null>(null);

  const { mutate } = useSWR(
    [
      `https://beer-bible-api.vercel.app/breweries/${brewery._id}`,
      session?.user.accessToken,
    ],
    getSingleBrewery
  );

  const validateCompanyName = () => {
    if (companyName.length < 2) {
      setNameError("Company name must be at least 2 characters");
    } else {
      setNameError(null);
    }
  };

  const onDismiss = () => {
    setNameError(null);
    setHasEdited(false);

    onClose();
  };

  const handleSave = async () => {
    setIsLoading(true);

    let hasUpdates = false; // Flag to check if there are any updates
    let updatedBrewery: Brewery | null = { ...editBrewery };

    if (brewery?.image !== editBrewery.image) {
      const newLogo = await updateImage(
        brewery.image,
        editBrewery.image as any
      );
      updatedBrewery.image = newLogo as any;
      hasUpdates = true;
    }
    if (brewery?.companyName !== companyName) {
      updatedBrewery.companyName = companyName;
      hasUpdates = true;
    }

    if (!hasUpdates) {
      // If no updates, simply return and maybe show a notification

      setIsLoading(false);
      onDismiss();
      return;
    }

    try {
      const savedBreweryInfo = await updateBreweryInfo({
        breweryId: brewery._id,
        updatedBrewery: updatedBrewery,
        accessToken: session?.user.accessToken,
      });
      if (savedBreweryInfo) {
        addToast("Brewery info updated", "success");
        mutate(savedBreweryInfo);
        setSelectedBrewery(savedBreweryInfo);
      }
    } catch (error: any) {
      console.error(error);
      addToast(error.error || error.message, "error");
    } finally {
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
        setPreviewImage(null);
      }
      setIsLoading(false);
      onDismiss();
    }
  };

  useEffect(() => {
    validateCompanyName();
  }, [companyName]);
  console.log(companyName.length, { nameError });
  return (
    <div className="flex flex-col justify-center items-center z-50 text-background my-auto ">
      <div className="flex w-full h-full justify-between items-center p-3 pb-0 sticky top-[-2px] bg-primary lg:hidden">
        <button
          onClick={() => {
            onDismiss();
            setCompanyName(brewery.companyName || "");
          }}
          className="btn btn-ghost bg-transparent text-background"
          type="button"
        >
          <X size={24} />
        </button>
        <h4>Edit Brewery Profile</h4>
        <SaveButton
          onClick={handleSave}
          className="ghost "
          isLoading={isLoading}
          disabled={!hasEdited}
        />
      </div>
      <div className="flex flex-col items-center p-6 pt-7 w-full">
        <div className="flex flex-col items-center">
          <div className="flex flex-col  items-center ">
            {/*  Existing Beer Image */}
            {editBrewery?.image && !previewImage ? (
              <ImageDisplay
                item={editBrewery}
                className="logo__edit m-3 bg-background !rounded-full"
              />
            ) : (
              editBrewery?.companyName &&
              !previewImage && (
                <div className=" flex px-1 py-[.5px] bg-accent justify-center items-center text-third-color font-bold text-3xl rounded-full w-24 h-24 m-3">
                  {getInitials(editBrewery.companyName || "")}
                </div>
              )
            )}
            {/* Preview of new image */}
            {previewImage && (
              <Image
                className="logo__edit"
                alt="New Brewery Logo"
                src={previewImage}
                width={50}
                height={50}
              />
            )}
          </div>

          <label
            htmlFor="fileUpload"
            className="text-sm hover:underline hover:cursor-pointer pt-3"
          >
            Change Logo
          </label>
          <input
            type="file"
            id="fileUpload"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files ? e.target.files[0] : null;
              if (file && file.size > 2 * 1024 * 1024) {
                // Check if file size is greater than 2MB
                addToast(
                  "File is too large. Please select a file less than 2MB.",
                  "error"
                );
                e.target.value = ""; // Clear the selected file
              } else {
                setEditBrewery({
                  ...editBrewery,
                  image: file as any,
                });
                // Generate a URL for the new image and set it as the preview
                const url = URL.createObjectURL(file as File);
                setPreviewImage(url);
              }
            }}
          />
        </div>
        <div className="text-center mt-10 w-full sm:w-1/2 lg:w-fit">
          <input
            type="text"
            id="fileUpload"
            className="form__input w-full !font-bold !text-2xl text-primary text-center focus:outline-none  "
            value={companyName}
            onChange={(e) => {
              setHasEdited(true);
              setCompanyName(e.target.value);
            }}
          />
          {nameError && <div className="error !text-xs">{nameError}</div>}
          <p className="mt-2 text-xs">
            This can be the company name or nickname.
            <br /> This is how brewery will appear to staff
          </p>
        </div>
      </div>
      <div className="flex justify-between w-2/3 p-3 lg:mt-2 ">
        <div className=" hidden lg:flex justify-between items-center w-full">
          <button
            className="btn border-none bg-transparent hover:bg-background hover:text-primary text-background"
            onClick={() => {
              onDismiss();
              setCompanyName(brewery.companyName || "");
            }}
            type="button"
          >
            Cancel
          </button>

          <SaveButton
            isLoading={isLoading}
            type="submit"
            onClick={handleSave}
            className=" ml-2 inverse"
            disabled={!hasEdited}
          />
        </div>
      </div>
    </div>
  );
};

export default EditBreweryProfile;
