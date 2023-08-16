"use client";
import { Users } from "@/app/types/users";
import { PencilLine, Trash } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

type Props = {
  staff: Users;
  role: string;
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
}: Props) => {
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [isChecked, setIsChecked] = useState(checkedStaffIds.has(staff._id));
  const [isAdmin, setIsAdmin] = useState<boolean>(admin);

  // update isChecked when checkedStaffIds changes
  useEffect(() => {
    setIsChecked(checkedStaffIds.has(staff._id));
  }, [checkedStaffIds]);

  console.log(staff.email, { isChecked });
  return (
    <tr
      key={staff._id}
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
      <td className="flex justify-end z-[1]">
        <button
          className="btn btn-circle btn-ghost"
          onClick={(e) => {
            e.stopPropagation(), setIsEdit(!isEdit);
          }}
        >
          {isEdit ? "Save" : <PencilLine size={24} strokeWidth={1} />}
        </button>
        {isChecked && (
          <>
            <div className="divider divider-horizontal"></div>
            <button className="btn btn-circle btn-ghost hover:bg-error">
              <Trash size={24} strokeWidth={1} />
            </button>
          </>
        )}
      </td>
      <th className="rounded-r-lg"></th>
    </tr>
  );
};

export default StaffMemberRow;
