"use client";
import { useToast } from "@/context/toast";
import { getInitials } from "@/lib/utils";
import { Pencil } from "lucide-react";
import { User } from "next-auth/core/types";
import Image from "next/image";
import { useEffect, useState } from "react";
import TrashCanIcon from "../Buttons/TrashCanIcon";

type Props = {
  user: User;
};

const UpdateUserPhoto = ({ user }: Props) => {
  const { addToast } = useToast();
  const [profileImg, setProfileImg] = useState<User | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  console.log({ profileImg, previewImage });

  return (
    <>
      <div className="flex flex-col items-center md:items-start w-full h-full  max-h-[550px]">
        <label htmlFor="update_image"></label>
        <input
          type="file"
          id="update_image"
          name="update_image"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files ? e.target.files[0] : null;
            if (file && file.size > 5 * 1024 * 1024) {
              // Check if file size is greater than 2MB
              addToast(
                "File is too large. Please select a file less than 5MB.",
                "error"
              );
              e.target.value = ""; // Clear the selected file
            } else {
              setProfileImg(file as any);
              // Generate a URL for the new image and set it as the preview
              const url = URL.createObjectURL(file as any);
              setPreviewImage(url as any);
            }
          }}
        />

        {/* User preview photo */}
        <label htmlFor="update_image" className="mask mask-squircle">
          {previewImage ? (
            <div className="relative w-24 h-24">
              <Image
                src={previewImage}
                alt={`profile picture of ${user.name}`}
                className="mask mask-squircle "
                width={50}
                height={50}
              />

              <TrashCanIcon
                onClick={(e) => {
                  URL.revokeObjectURL(previewImage as any);
                  setPreviewImage(null);
                  setProfileImg(null);
                }}
                className="absolute bottom-0 right-0 p-4 z-10 hover:cursor-pointer"
              />
            </div>
          ) : user.picture ? (
            <Image
              src={user.picture}
              alt={`profile picture of ${user.name}`}
              className="mask mask-squircle"
              width={50}
              height={50}
            />
          ) : (
            <div className=" rounded-xl w-48 h-60 md:h-full md:w-full hover:cursor-pointer relative">
              <div className=" flex px-1 py-[.5px] bg-accent justify-center items-center text-primary font-bold text-3xl rounded-full w-24 h-24">
                {getInitials(user.name || (user.fullName as string))}
              </div>

              <Pencil
                size={24}
                className="absolute bottom-0 right-0 p-4 z-10 hover:cursor-pointer"
              />
            </div>
          )}
        </label>
      </div>
    </>
  );
};

export default UpdateUserPhoto;
