"use client";
import { Users } from "@/types/users";
import { useBreweryContext } from "@/context/brewery-beer";
import updateBreweryAdmin from "@/lib/PATCH/updateBreweryAdmin";
import { PencilLine, SkullIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { RefObject, useEffect, useRef, useState } from "react";
import SaveButton from "../Buttons/SaveButton";

import deleteStaffMember from "@/lib/DELETE/deleteStaffMemeber";
import TrashCanIcon from "../Buttons/TrashCanIcon";
import AlertDialog from "../Alerts/AlertDialog";
import { useToast } from "@/context/toast";
import { getInitials } from "@/lib/utils";
import useSWR from "swr";
import getSingleBrewery from "@/lib/getSingleBrewery";

type Props = {
  staff: Users;
  role: string;
  breweryId: string;
  checkedStaffIds: Set<string>;
  handleCheckboxChange: (id: string) => void;
  admin: boolean;
};

const StaffMemberCard = ({
  staff,
  role,
  checkedStaffIds,
  handleCheckboxChange,
  admin,
  breweryId,
}: Props) => {
  const { data: session } = useSession();

  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState<boolean>(false);

  const [isChecked, setIsChecked] = useState(checkedStaffIds.has(staff._id));
  const [isAdmin, setIsAdmin] = useState<boolean>(admin);
  const [initialIsAdmin, setInitialIsAdmin] = useState(admin); // compare to isAdmin for change
  const [hasChanged, setHasChanged] = useState<boolean>(false);
  const [deleteStaffMemberAlert, setDeleteStaffMemberAlert] =
    useState<boolean>(false);

  const { addToast } = useToast();
  const rowRef = useRef(null);

  const { mutate } = useSWR(
    [
      `https://beer-bible-api.vercel.app/breweries/${breweryId}`,
      session?.user.accessToken,
    ],
    getSingleBrewery
  );

  // update if user is admin or not of Brewery
  const handleAdminChange = async () => {
    if (initialIsAdmin !== isAdmin) {
      setIsLoading(true);
      const action = isAdmin ? "add" : "remove";

      try {
        if (breweryId && session?.user.accessToken) {
          const updatedAdmin = await updateBreweryAdmin({
            userId: staff._id,
            breweryId,
            action,
            accessToken: session?.user.accessToken,
          });

          addToast(updatedAdmin.message, "success");
          mutate();

          // After successfully updating, set the initialIsAdmin to the current isAdmin value
          setInitialIsAdmin(isAdmin);
          setHasChanged(false);
        } else {
          throw new Error("Missing breweryId or accessToken");
        }
      } catch (error: any) {
        console.log(error);
        addToast(error.message, "error");
      } finally {
        setIsEdit(false);
        setIsLoading(false);
      }
    } else {
      // If the isAdmin value hasn't changed, simply close the edit without making an API call
      setIsEdit(false);
    }
  };

  const handleDeleteStaff = async () => {
    setIsDeleteLoading(true);
    try {
      if (!isChecked || !breweryId || !session?.user.accessToken) return;
      const result = await deleteStaffMember({
        breweryId,
        userId: staff._id,
        accessToken: session?.user.accessToken,
      });

      addToast(result.message, "success");
      mutate();

      // Display success message from the result
    } catch (err: any) {
      console.error(err);
      addToast(err.message, "error"); // Displaying the error message as an alert on the client side
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEdit(false);
    setIsAdmin(initialIsAdmin);
    setHasChanged(false);
  };

  const handleOwnerClick = () => {
    setTimeout(() => {
      addToast("Owner can't be messed with!", "info");
    }, 200); // Show tooltip after 1 second of pressing
  };

  const useOutsideClick = (
    ref: RefObject<HTMLDivElement>,
    callback: () => void
  ) => {
    useEffect(() => {
      function handleClickOutside(event: Event) {
        if (ref.current && !ref.current.contains(event.target as Node)) {
          callback();
        }
      }

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [ref, callback]);
  };

  //  close edit mode when clicking outside of row
  useOutsideClick(rowRef, () => {
    if (isEdit) {
      handleCancelEdit();
    }
  });

  // update isChecked when checkedStaffIds changes
  useEffect(() => {
    setIsChecked(checkedStaffIds.has(staff._id));
  }, [checkedStaffIds]);

  return (
    <div
      key={staff._id}
      ref={rowRef}
      className={` table-row__effect flex justify-center xs:justify-between p-6 relative ${
        isChecked ? "table-row__checked" : " category-card"
      }`}
      onClick={() => {
        if (isEdit) return;
        handleCheckboxChange(staff._id);
      }}
    >
      <AlertDialog
        title="You sure?"
        message={`Are you sure you want to remove ${staff.fullName} from staff?`}
        isOpen={deleteStaffMemberAlert}
        onClose={() => setDeleteStaffMemberAlert(false)}
        onConfirm={handleDeleteStaff}
        confirmButtonText="Remove"
      />

      <div
        className={`flex flex-col items-center xs:flex-row space-y-3 xs:space-y-0 xs:space-x-6 transition-all  ${
          isEdit ? "items-start" : ""
        }`}
      >
        {staff.image ? (
          <div className="avatar">
            <div className="mask mask-squircle object-cover h-20">
              <Image
                src={staff.image || ""}
                alt={`profile picture of ${staff.fullName}`}
                className=""
                width={50}
                height={50}
              />
            </div>
          </div>
        ) : (
          staff && (
            <div className="py-1 px-[.15rem] bg-accent text-primary font-bold text-3xl rounded-full">
              {getInitials(staff.fullName)}
            </div>
          )
        )}
        <div
          className={`xs:space-y-1 transition-all text-center xs:text-left space-y-1 ${
            isEdit ? "pb-14" : ""
          }`}
        >
          <div className=" font-bold">{staff.fullName}</div>
          <div className="text-xs xxs:text-sm opacity-50">{staff.email}</div>
          <div className="flex items-center justify-center xs:justify-start">
            <span
              className={`${
                isEdit
                  ? "flex justify-center items-center gap-2 z-1"
                  : "badge font-normal"
              }`}
            >
              {isEdit ? (
                <>
                  <label className="cursor-pointer label w-fit">
                    {isAdmin ? "Admin" : "Crew"}
                  </label>
                  <input
                    type="checkbox"
                    className="toggle toggle-accent"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsAdmin(!isAdmin);
                      setHasChanged(true);
                    }}
                    checked={isAdmin}
                  />
                </>
              ) : (
                role
              )}
            </span>
            {isChecked && !isEdit && role !== "Owner" && (
              <span>
                <button
                  className={`btn btn-sm btn-circle btn-ghost`}
                  onClick={(e) => {
                    e.stopPropagation(), setIsEdit(true);
                  }}
                >
                  <PencilLine size={24} strokeWidth={1} />
                </button>
              </span>
            )}
          </div>
          {isEdit && (
            <div className="flex gap-3 absolute bottom-4 right-0 px-4 ">
              <button
                className="btn btn-ghost text-primary " // Made the button more visible
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
              <SaveButton
                onClick={(e) => {
                  e.stopPropagation(), handleAdminChange();
                }}
                isLoading={isLoading}
                disabled={!hasChanged}
              />
            </div>
          )}
        </div>
      </div>

      {/* If owner, skull */}
      <div className="absolute top-0 right-0 z-1 flex flex-col justify-between">
        {isChecked && role === "Owner" ? (
          <div
            className="btn btn-circle btn-ghost"
            onClick={(e) => {
              e.stopPropagation(), handleOwnerClick();
            }}
          >
            <SkullIcon size={26} strokeWidth={1} />
          </div>
        ) : (
          isChecked && (
            <>
              <TrashCanIcon
                onClick={(e) => {
                  e.stopPropagation(), setDeleteStaffMemberAlert(true);
                }}
                isLoading={isDeleteLoading}
                className="btn btn-circle btn-ghost"
              />
            </>
          )
        )}
      </div>
    </div>
  );
};

export default StaffMemberCard;
