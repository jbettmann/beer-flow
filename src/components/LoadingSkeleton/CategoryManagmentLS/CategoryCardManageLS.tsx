import React from "react";

type Props = {};

const CategoryCardManageLS = (props: Props) => {
  return (
    <div
      className={`animate-pulse flex items-center justify-between bg-gray-200 h-36 p-4 `}
    >
      <div className="flex justify-between p-6">
        <div className="flex justify-center items-center space-x-3">
          <div className="h-8 w-10 bg-gray-300"></div>
          <div className="font-bold flex justify-center items-center w-full">
            <div className="h-6 w-32 bg-gray-400"></div>
          </div>
        </div>
      </div>

      <div className="h-6 w-6 bg-gray-300"></div>
    </div>
  );
};

export default CategoryCardManageLS;
