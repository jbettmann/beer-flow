import React from "react";

type Props = {};

const StaffManagementTable = (props: Props) => {
  return (
    <div className="flex flex-col w-full lg:flex-row">
      <div className="hidden lg:flex-initial lg:w-24 mr-4 lg:card lg:bg-base-100  lg:space-y-2  bg-gray-200 animate-pulse  p-4">
        {[...Array(3)].map((_, idx) => (
          <div
            key={idx}
            className="w-full h-8 rounded-md bg-gray-200 animate-pulse"
          ></div>
        ))}
      </div>

      <div className=" grow border-r-8 border-gray-200 animate-pulse">
        <table className="table ">
          {/* head */}
          <thead>
            <tr>
              <th className="w-8 h-8 bg-gray-200 animate-pulse"></th>
              <th className="w-1/4 h-8 bg-gray-200 animate-pulse"></th>
              <th className="w-1/4 h-8 bg-gray-200 animate-pulse"></th>
              <th className="w-1/4 h-8 bg-gray-200 animate-pulse"></th>
              <th className="w-1/4 h-8 bg-gray-200 animate-pulse"></th>
            </tr>
          </thead>
          <tbody>
            {[...Array(6)].map((_, idx) => (
              <tr key={idx} className="grow">
                <th className="w-8 h-2 bg-gray-200 animate-pulse"></th>
                <td className="flex items-center space-x-3 w-full">
                  <div className="avatar w-12 h-12 bg-gray-200 animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 animate-pulse w-32"></div>
                    <div className="h-3 bg-gray-200 animate-pulse w-24"></div>
                  </div>
                </td>
                <td className=" space-y-2 w-full"></td>

                <th></th>
              </tr>
            ))}
          </tbody>
          {/* foot */}
          <tfoot>
            <tr>
              <th className="w-8 h-8 bg-gray-200 animate-pulse"></th>
              <th className="w-1/4 h-8 bg-gray-200 animate-pulse"></th>
              <th className="w-1/4 h-8 bg-gray-200 animate-pulse"></th>
              <th className="w-1/4 h-8 bg-gray-200 animate-pulse"></th>
              <th className="w-1/4 h-8 bg-gray-200 animate-pulse"></th>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default StaffManagementTable;
