"use client";
import { Users } from "@/app/types/users";
import { useBreweryContext } from "@/context/brewery-beer";
import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Brewery } from "@/app/types/brewery";
import { MoveDown, MoveUp, PencilLine } from "lucide-react";
import StaffMemberRow from "./StaffMemberRow";
import { set } from "mongoose";

type Props = {
  viewFilter: string;
  brewery: Brewery | null;
};

const StaffTable = ({ viewFilter, brewery }: Props) => {
  const [staff, setStaff] = useState<Users[] | string[] | number | any>([
    ...brewery?.staff,
    brewery?.owner,
  ]);

  const [checkedStaffIds, setCheckedStaffIds] = useState<Set<string>>(
    new Set()
  );
  const [selectAll, setSelectAll] = useState<boolean>(false);

  const [isAlphabetical, setIsAlphabetical] = useState<boolean>(false);

  const adminIds = useMemo(
    () => new Set(brewery?.admin.map((admin) => admin._id)),
    [brewery]
  );

  const handleAlphabetizeName = () => {
    setIsAlphabetical(!isAlphabetical);
    if (isAlphabetical) {
      setStaff(staff.sort((a, b) => b.fullName.localeCompare(a.fullName)));
    } else {
      setStaff(staff.sort((a, b) => a.fullName.localeCompare(b.fullName)));
    }
  };

  const handleSelectAllStaff = () => {
    if (selectAll) {
      const newCheckedStaffIds = new Set<string>(staff.map((s) => s._id));

      setCheckedStaffIds(newCheckedStaffIds);
    } else setCheckedStaffIds(new Set());
  };

  const handleCheckboxChange = (id: string) => {
    const newCheckedStaffIds = new Set(checkedStaffIds);
    if (!newCheckedStaffIds.has(id)) {
      newCheckedStaffIds.add(id);
    } else {
      newCheckedStaffIds.delete(id);
    }
    setCheckedStaffIds(newCheckedStaffIds);
  };

  useEffect(() => {
    if (brewery) {
      if (viewFilter === "All Staff")
        setStaff([...brewery.staff, brewery.owner]);
      if (viewFilter === "Admin") setStaff([...brewery.admin, brewery.owner]);
      if (viewFilter === "Crew")
        setStaff(
          brewery.staff.filter(
            (crew) => crew._id !== brewery?.owner._id && !adminIds.has(crew._id)
          )
        );
    }
  }, [viewFilter]);

  useEffect(() => {
    handleSelectAllStaff();
  }, [selectAll]);

  // resets staff when brewery changes (staff deleted, added, etc.)
  useEffect(() => {
    setStaff([...brewery?.staff, brewery?.owner]);
  }, [brewery]);

  console.log({ isAlphabetical, brewery });

  return (
    brewery && (
      <div className="overflow-x-auto flex-auto lg:pl-8">
        <table className="table border-separate border-spacing-y-6 p-3">
          {/* head */}
          <thead>
            <tr>
              <th>
                <label>
                  <input
                    type="checkbox"
                    className="checkbox"
                    onChange={() => setSelectAll(!selectAll)}
                  />
                </label>
              </th>
              <th>
                Name{" "}
                <span>
                  <button className="ml-2 " onClick={handleAlphabetizeName}>
                    {isAlphabetical ? (
                      <MoveDown size={15} />
                    ) : (
                      <MoveUp size={15} />
                    )}
                  </button>
                </span>
              </th>
              <th>Role</th>

              <th className="text-right">Manage</th>
            </tr>
          </thead>
          <tbody className="">
            {staff && staff.length !== 0 ? (
              staff.map((s) => {
                const role =
                  s._id === brewery?.owner._id
                    ? "Owner"
                    : adminIds.has(s._id)
                    ? "Admin"
                    : "Crew";
                return (
                  <StaffMemberRow
                    key={s._id}
                    staff={s}
                    role={role}
                    admin={adminIds.has(s._id)}
                    breweryId={brewery._id}
                    handleCheckboxChange={handleCheckboxChange}
                    checkedStaffIds={checkedStaffIds}
                  />
                );
              })
            ) : (
              <tr>
                <th></th>
                <td>
                  <p>No staff</p>
                </td>
                <th></th>
              </tr>
            )}
          </tbody>
          {/* foot */}
          <tfoot>
            <tr>
              <th></th>
              <th>Name</th>
              <th>Role</th>

              <th className="text-right">Manage</th>
            </tr>
          </tfoot>
        </table>
      </div>
    )
  );
};

export default StaffTable;
