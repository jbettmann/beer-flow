"use client";
import { Users } from "@/app/types/users";
import { useBreweryContext } from "@/context/brewery-beer";
import updateBreweryAdmin from "@/lib/PATCH/updateBreweryAdmin";
import { PencilLine, SkullIcon, Trash } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import SaveButton from "../Buttons/SaveButton";
import { useOutsideClick } from "@/lib/utils";
import { set } from "mongoose";
import deleteStaffMember from "@/lib/DELETE/deleteStaffMemeber";
import TrashCanIcon from "../Buttons/TrashCanIcon";

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
  const [isChecked, setIsChecked] = useState(checkedStaffIds.has(staff._id));
  const [isAdmin, setIsAdmin] = useState<boolean>(admin);
  const [initialIsAdmin, setInitialIsAdmin] = useState(admin); // compare to isAdmin for change

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
          alert(updatedAdmin.message);
          setSelectedBrewery(updatedAdmin.brewery);

          // After successfully updating, set the initialIsAdmin to the current isAdmin value
          setInitialIsAdmin(isAdmin);
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
    setIsLoading(true);
    try {
      if (!isChecked || !breweryId || !session?.user.accessToken) return;
      const result = await deleteStaffMember({
        breweryId,
        userId: staff._id,
        accessToken: session?.user.accessToken,
      });
      console.log(result.message, result.updatedBrewery);
      alert(result.message);
      setSelectedBrewery(result.updatedBrewery);
      // Display success message from the result
    } catch (err) {
      console.error(err);
      alert(err.message); // Displaying the error message as an alert on the client side
    } finally {
      setIsLoading(false);
    }
  };

  //  close edit mode when clicking outside of row
  useOutsideClick(rowRef, () => {
    if (isEdit) {
      setIsEdit(false);
    }
  });

  // update isChecked when checkedStaffIds changes
  useEffect(() => {
    setIsChecked(checkedStaffIds.has(staff._id));
  }, [checkedStaffIds]);

  return (
    <tr
      key={staff._id}
      ref={rowRef}
      className={`transition-all rounded-lg hover:shadow-lg hover:cursor-pointer ${
        isChecked ? "bg-indigo-200" : ""
      }`}
      onClick={() => {
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
          <div className="avatar">
            <div className="mask mask-squircle w-12 h-12">
              <Image
                src={staff.image || ""}
                alt={`profile picture of ${staff.fullName}`}
                className=""
                width={50}
                height={50}
              />
            </div>
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
                  e.stopPropagation(), setIsAdmin(!isAdmin);
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
      <td className="flex justify-end z-[1]">
        {role === "Owner" ? (
          <div className="btn btn-circle btn-ghost">
            <SkullIcon size={26} strokeWidth={1} />
          </div>
        ) : (
          // If not owner, edit and delete
          <>
            {isEdit ? (
              <SaveButton
                onClick={(e) => {
                  e.stopPropagation(), handleAdminChange();
                }}
                isLoading={isLoading}
              />
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
                    e.stopPropagation(), handleDeleteStaff();
                  }}
                  isLoading={isLoading}
                />
              </>
            )}
          </>
        )}
      </td>
      <th className="rounded-r-lg"></th>
    </tr>
  );
};

export default StaffMemberRow;
