import React from "react";

type Props = {};

const StaffManagementTableLS = (props: Props) => {
  return (
    <div className="overflow-x-auto">
      <table className="table w-full">
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
          {[...Array(4)].map((_, idx) => (
            <tr key={idx}>
              <th className="w-8 h-8 bg-gray-200 animate-pulse"></th>
              <td className="flex items-center space-x-3">
                <div className="avatar w-12 h-12 bg-gray-200 animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 animate-pulse w-32"></div>
                  <div className="h-3 bg-gray-200 animate-pulse w-24"></div>
                </div>
              </td>
              <td className="flex flex-col space-y-2">
                <div className="h-4 bg-gray-200 animate-pulse w-40"></div>
                <div className="h-3 bg-gray-200 animate-pulse w-32"></div>
              </td>
              <td className="h-4 bg-gray-200 animate-pulse w-24"></td>
              <td className="h-6 bg-gray-200 animate-pulse w-20"></td>
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
  );
};

export default StaffManagementTableLS;
