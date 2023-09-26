import { Brewery } from "@/app/types/brewery";
import { Save, X } from "lucide-react";
import React, { useState } from "react";
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

  const { mutate } = useSWR(
    [
      `https://beer-bible-api.vercel.app/breweries/${brewery._id}`,
      session?.user.accessToken,
    ],
    getSingleBrewery
  );

  const handleSave = async () => {
    setIsLoading(true);

    let hasUpdates = false; // Flag to check if there are any updates
    let updatedBrewery: Brewery | null = { ...editBrewery };

    if (brewery?.image !== editBrewery.image) {
      const newLogo = await updateImage(brewery.image, editBrewery.image);
      updatedBrewery.image = newLogo;
      hasUpdates = true;
    }
    if (brewery?.companyName !== companyName) {
      updatedBrewery.companyName = companyName;
      hasUpdates = true;
    }

    if (!hasUpdates) {
      // If no updates, simply return and maybe show a notification

      setIsLoading(false);
      onClose();
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
      onClose();
    }
  };
  return (
    <div className="flex flex-col justify-center items-center z-50 text-primary">
      <div className="flex w-full h-full justify-between items-center">
        {" "}
        <button onClick={onClose} className="btn m-4">
          <X size={24} />
        </button>
        <h4>Edit Brewery Profile</h4>
        <SaveButton
          onClick={handleSave}
          className="btn btn-accent m-4"
          isLoading={isLoading}
        />
      </div>
      <div className="flex flex-col items-center p-6 pt-7 w-full">
        <div className="flex flex-col items-center">
          <div className="flex flex-col  items-center">
            {/*  Existing Beer Image */}
            {editBrewery?.image && !previewImage ? (
              <ImageDisplay item={editBrewery} className="logo__edit m-3" />
            ) : (
              editBrewery?.companyName &&
              !previewImage && (
                <div className=" logo__default m-3">
                  {getInitials(editBrewery.companyName || "")}
                </div>
              )
            )}
            {/* Preview of new image */}
            {previewImage && (
              <Image
                className="logo__edit"
                alt="New Beer Image preview"
                src={previewImage}
                width={50}
                height={50}
              />
            )}
          </div>

          <label
            htmlFor="fileUpload"
            className="text-sm hover:underline hover:cursor-pointer"
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
                  image: file,
                });
                // Generate a URL for the new image and set it as the preview
                const url = URL.createObjectURL(file);
                setPreviewImage(url);
              }
            }}
          />
        </div>
        <div className="text-center mt-10">
          <input
            type="text"
            id="fileUpload"
            className="input w-full font-bold text-2xl text-primary text-center border-b-2 border-gray-400 focus:outline-none focus:border-accent "
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
          <p className="mt-2 text-xs">
            This can be the company name or nickname.
            <br /> This is how brewery will appear to staff{" "}
          </p>
        </div>
      </div>
    </div>
  );
};

export default EditBreweryProfile;
