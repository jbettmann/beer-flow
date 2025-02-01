"use client";
import { Brewery } from "@/app/types/brewery";
import { useBreweryContext } from "@/context/brewery-beer";
import { useToast } from "@/context/toast";
import getSingleBrewery from "@/lib/getSingleBrewery";
import updateBreweryInfo from "@/lib/PUT/updateBreweryInfo";
import { updateImage } from "@/lib/supabase/updateImage";
import { getInitials } from "@/lib/utils";
import { X } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import useSWR from "swr";
import SaveButton from "../Buttons/SaveButton";
import ImageDisplay from "../ImageDisplay/ImageDisplay";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

type Props = {
  brewery: Brewery;
  onClose: () => void;
};

const EditBreweryProfile = ({ brewery, onClose }: Props) => {
  const { data: session } = useSession();
  const { addToast } = useToast();
  const { setSelectedBrewery } = useBreweryContext();
  const [isLoading, setIsLoading] = useState(false);
  const [imageUploaded, setImageUploaded] = useState<File | null>(null);
  const [editBrewery, setEditBrewery] = useState(brewery || {});
  const [companyName, setCompanyName] = useState(brewery.companyName || "");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [hasEdited, setHasEdited] = useState<boolean>(false);
  const [nameError, setNameError] = useState<string | null>(null);

  const { mutate } = useSWR(
    [`https://beer-bible-api.vercel.app/breweries/${brewery._id}`],
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
    setImageUploaded(null);
    onClose();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("file exisit");
      setHasEdited(true);
      console.log("has changed set");
      // Create temporary preview URL
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);

      // Update state with FILE object
      setImageUploaded(file);
      console.log("setImageUploaded", file);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);

    let hasUpdates = false; // Flag to check if there are any updates
    let updatedBrewery: Brewery | null = { ...editBrewery };
    console.log("editBrewery", editBrewery, "imageUploaded", imageUploaded);
    if (imageUploaded) {
      const newLogo = await updateImage(brewery.image, imageUploaded as any);
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
        updatedBrewery,
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

  return (
    <div className="flex flex-col justify-center items-center z-50 text-background my-auto ">
      <div className="flex w-full h-full justify-between items-center p-3 pb-0 sticky top-[-2px] bg-primary lg:hidden">
        <Button
          variant="ghost"
          onClick={() => {
            onDismiss();
            setCompanyName(brewery.companyName || "");
          }}
          type="button"
        >
          <X size={24} />
        </Button>
        <h4>Edit Brewery Profile</h4>
        <SaveButton
          onClick={handleSave}
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
          <Label htmlFor="fileUpload">
            <Button
              variant="outline"
              className="text-sm hover:underline hover:cursor-pointer pt-3"
              asChild
            >
              <span>Change Logo</span>
            </Button>
          </Label>

          <Input
            type="file"
            id="fileUpload"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleImageChange(e)}
          />
        </div>
        <div className="text-center mt-10 w-full sm:w-1/2 lg:w-full">
          <Input
            id="companyName"
            className="w-full font-bold text-2xl text-primary text-center focus-visible:ring-transparent border-none"
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
          <Button
            variant="ghost"
            onClick={() => {
              onDismiss();
              setCompanyName(brewery.companyName || "");
            }}
            type="button"
          >
            Cancel
          </Button>

          <SaveButton
            isLoading={isLoading}
            type="submit"
            onClick={handleSave}
            className=" ml-2 "
            disabled={!hasEdited}
          />
        </div>
      </div>
    </div>
  );
};

export default EditBreweryProfile;
