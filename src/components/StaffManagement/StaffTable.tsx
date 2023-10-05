"use client";
import { Brewery } from "@/app/types/brewery";
import { Users } from "@/app/types/users";
import { cn } from "@/lib/utils";
import { ListFilter, MoveDown, MoveUp, UserPlus } from "lucide-react";
import React, { use, useEffect, useMemo, useRef, useState } from "react";
import StaffMemberCard from "./StaffMemberCard";
import StaffMemberRow from "./StaffMemberRow";

type Props = {
  viewFilter: string;
  brewery: Brewery | null;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const StaffTable = ({ viewFilter, brewery, setIsOpen }: Props) => {
  const [staff, setStaff] = useState<Users[] | string[] | number | any>([
    ...(brewery?.staff as Users[]),
    brewery?.owner,
  ]);

  const [checkedStaffIds, setCheckedStaffIds] = useState<Set<string>>(
    new Set()
  );
  const [selectAll, setSelectAll] = useState<boolean>(false);

  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [isAlphabetical, setIsAlphabetical] = useState<boolean | null>(null);

  const ref = useRef<HTMLDivElement>(null);

  const adminIds = useMemo(
    () => new Set(brewery?.admin.map((admin: any) => admin._id)),
    [brewery]
  );

  // Filter menu options for small screen
  const menuButtons = [
    {
      title: "A-Z",
      setFilterState: () => {
        setIsAlphabetical(true);
        handleAlphabetizeName();
      },
      type: "NAME",
    },
    {
      title: "Z-A",
      setFilterState: () => {
        setIsAlphabetical(false);
        handleAlphabetizeName();
      },
      type: "NAME",
    },
  ];

  const handleAlphabetizeName = () => {
    setIsAlphabetical(!isAlphabetical);
    if (isAlphabetical) {
      setStaff(
        staff.sort(
          (a: Users, b: Users) => b?.fullName.localeCompare(a?.fullName)
        )
      );
    } else {
      setStaff(
        staff.sort(
          (a: Users, b: Users) => a?.fullName.localeCompare(b?.fullName)
        )
      );
    }
  };

  //onclick handler when clicking a menu item
  const handleCloseFilter = () => {
    setIsFilterOpen(false);
  };

  const handleSelectAllStaff = () => {
    if (selectAll) {
      const newCheckedStaffIds = new Set<string>(
        staff.map((s: Users) => s._id)
      );

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
            (crew: any) =>
              crew._id !== (brewery?.owner as Users)._id &&
              !adminIds.has(crew._id)
          )
        );
    }
  }, [viewFilter]);

  useEffect(() => {
    handleSelectAllStaff();
  }, [selectAll]);

  // resets staff when brewery changes (staff deleted, added, etc.)
  useEffect(() => {
    setStaff([...(brewery?.staff as Users[]), brewery?.owner]);
  }, [brewery]);

  return (
    brewery && (
      <>
        <div
          className={`flex justify-between mx-auto lg:hidden w-full max-w-[367px] px-3`}
        >
          <label className="flex items-center ">
            <input
              type="checkbox"
              className="checkbox   ml-1 mr-2 "
              onChange={() => setSelectAll(!selectAll)}
              checked={selectAll}
            />
            Select All
          </label>

          <div
            ref={ref}
            className={` flex-initial z-[1] dropdown-end bg-transparent lg:z-0 ${cn(
              {
                dropdown: true,
                "dropdown-open ": isFilterOpen,
              }
            )}`}
          >
            <label
              className="btn btn-ghost !pr-1 w-full"
              tabIndex={0}
              onClick={() => setIsFilterOpen((prev) => !prev)}
            >
              <ListFilter size={20} />
            </label>
            <ul
              tabIndex={0}
              className={cn({
                "dropdown-content menu p-2 shadow rounded-box bg-primary text-background":
                  true,
                hidden: !isFilterOpen,
              })}
            >
              {menuButtons.map((button, i) => (
                <li key={i}>
                  <button
                    className="btn btn-ghost "
                    onClick={() => {
                      button.setFilterState();
                      handleCloseFilter();
                    }}
                  >
                    {button.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="overflow-x-auto flex-auto flex justify-center   lg:pl-8 ">
          <table className="hidden lg:table border-separate border-spacing-y-6 p-3">
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
                  Name
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
                staff.map((s: Users) => {
                  const role =
                    s._id === (brewery?.owner as Users)._id
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
                  <th></th>
                  <td>
                    <div className="text-primary text-opacity-70 flex flex-col justify-center items-center gap-3">
                      <h5>No crew members... yet!</h5>

                      <button
                        onClick={() => setIsOpen(true)}
                        className="create-btn"
                      >
                        Invite members <UserPlus size={20} />
                      </button>
                    </div>
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

          {/* Small Screen Card Layout*/}
          <div className=" lg:hidden flex flex-col py-3 xxs:p-3  relative">
            <div className="flex flex-col gap-8 ">
              {staff.length > 0 && staff ? (
                staff.map((s: Users) => {
                  const role =
                    s._id === (brewery?.owner as Users)._id
                      ? "Owner"
                      : adminIds.has(s._id)
                      ? "Admin"
                      : "Crew";
                  return (
                    <StaffMemberCard
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
                <div className="text-primary text-opacity-70 flex flex-col justify-center items-center gap-3 mt-10">
                  <h5>No crew members... yet!</h5>

                  <button
                    onClick={() => setIsOpen(true)}
                    className="create-btn"
                  >
                    Invite members <UserPlus size={20} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    )
  );
};

export default StaffTable;
