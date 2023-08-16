"use client";
import { Users } from "@/app/types/users";
import { useBreweryContext } from "@/context/brewery-beer";
import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Brewery } from "@/app/types/brewery";
import { PencilLine } from "lucide-react";
import StaffMemberRow from "./StaffMemberRow";

type Props = {
  viewFilter: string;
  brewery: Brewery | null;
};

const StaffTable = ({ viewFilter, brewery }: Props) => {
  const [staff, setStaff] = useState<Users[] | string[] | number | any>(
    brewery?.staff
  );

  const [checkedStaffIds, setCheckedStaffIds] = useState<Set<string>>(
    new Set()
  );

  const adminIds = useMemo(
    () => new Set(brewery?.admin.map((admin) => admin._id)),
    [brewery]
  );

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

  console.log({ checkedStaffIds });

  return (
    brewery && (
      <div className="overflow-x-auto flex-auto lg:pl-8">
        <table className="table border-separate border-spacing-y-6 p-3">
          {/* head */}
          <thead>
            <tr>
              <th>
                <label>
                  <input type="checkbox" className="checkbox" />
                </label>
              </th>
              <th>Name</th>
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
