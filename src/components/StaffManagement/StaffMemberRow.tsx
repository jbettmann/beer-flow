"use client";
import { Users } from "@/app/types/users";
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

type Props = {
  staff: Users;
  role: string;
  breweryId: string;
  checkedStaffIds: Set<string>;
  handleCheckboxChange: (id: string) => void;
  admin: boolean;
};

const StaffMemberRow = ({
  staff,
  role,
  checkedStaffIds,
  handleCheckboxChange,
  admin,
  breweryId,
}: Props) => {
  const { data: session } = useSession();
  const { setSelectedBrewery } = useBreweryContext();
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

          console.log(updatedAdmin.message);
          addToast(updatedAdmin.message, "success");
          setSelectedBrewery(updatedAdmin.brewery);

          // After successfully updating, set the initialIsAdmin to the current isAdmin value
          setInitialIsAdmin(isAdmin);
          setHasChanged(false);
        }
      } catch (error) {
        console.log(error);
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
      setSelectedBrewery(result.updatedBrewery);
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
    <>
      <AlertDialog
        title="You sure?"
        message={`Are you sure you want to remove ${staff.fullName} from staff?`}
        isOpen={deleteStaffMemberAlert}
        onClose={() => setDeleteStaffMemberAlert(false)}
        onConfirm={handleDeleteStaff}
        confirmButtonText="Remove"
      />
      <tr
        key={staff._id}
        ref={rowRef}
        className={` table-row__effect border category-card ${
          isChecked ? "table-row__checked" : ""
        }`}
        onClick={() => {
          if (isEdit) return;
          handleCheckboxChange(staff._id);
        }}
      >
        <th className="rounded-l-lg">
          <label>
            <input
              type="checkbox"
              className="checkbox"
              value={staff._id}
              // onChange={handleCheckboxChange}
              checked={checkedStaffIds.has(staff._id)}
            />
          </label>
        </th>
        <td>
          <div className="flex items-center space-x-6">
            <div className="">
              {staff.image ? (
                <div className="mask mask-squircle avatar w-12 h-12">
                  <Image
                    src={staff.image || ""}
                    alt={`profile picture of ${staff.fullName}`}
                    className=""
                    width={50}
                    height={50}
                  />
                </div>
              ) : (
                <div className="py-1 px-[.15rem] bg-accent text-primary font-bold text-3xl rounded-full">
                  {getInitials(staff.fullName)}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="font-bold">{staff.fullName}</div>
              <div className="text-sm opacity-50">{staff.email}</div>
            </div>
          </div>
        </td>

        <td className="z-[1]">
          {isEdit ? (
            <div className="form-control flex flex-col justify-center">
              <div className="label-text ml-1">Admin</div>

              <label className="cursor-pointer label w-fit">
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
              </label>
            </div>
          ) : (
            role
          )}
        </td>
        {/* If owner, skull */}
        <td className=" z-[2]">
          <div className="flex items-center justify-end  z-[2]">
            {role === "Owner" ? (
              <div
                className="btn btn-circle btn-ghost "
                onClick={(e) => {
                  e.stopPropagation(), handleOwnerClick();
                }}
              >
                <SkullIcon size={26} strokeWidth={1} />
              </div>
            ) : (
              // If not owner, edit and delete
              <>
                {isEdit ? (
                  <div className="flex gap-3 px-4  z-[2]">
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
                ) : (
                  <button
                    className={`btn btn-circle btn-ghost`}
                    onClick={(e) => {
                      e.stopPropagation(), setIsEdit(true);
                    }}
                  >
                    <PencilLine size={24} strokeWidth={1} />
                  </button>
                )}
                {isChecked && (
                  <>
                    <div className="divider divider-horizontal"></div>

                    <TrashCanIcon
                      onClick={(e) => {
                        e.stopPropagation(), setDeleteStaffMemberAlert(true);
                      }}
                      isLoading={isDeleteLoading}
                      className="btn btn-circle btn-ghost"
                    />
                  </>
                )}
              </>
            )}
          </div>
        </td>

        <th className="rounded-r-lg"></th>
      </tr>
    </>
  );
};

export default StaffMemberRow;
