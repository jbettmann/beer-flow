import React from "react";
import CategoryCardManageLS from "./CategoryCardManageLS";
import CategoryManageTableLS from "../EditCategoryNameLS";
import StaffManagementTable from "../StaffManagementTableLS";

type Props = {};

const CategoryManagementLS = (props: Props) => {
  return (
    <>
      <div className="mx-auto w-full  h-full lg:hidden mb-4 flex flex-col gap-4">
        <div className="h-12 w-full bg-gray-500 mb-10"></div>
        <div className="mx-auto w-full  lg:hidden mb-4 flex flex-col gap-4">
          {[...Array(4)].map((_, j) => (
            <CategoryCardManageLS />
          ))}
        </div>
      </div>
      <div className="hidden lg:block w-full lg:h-full lg:m-auto ">
        <div className=" flex justify-between py-8 ">
          <div className="bg-gray-300 w-36 h-8 animate-pulse"></div>
          <button className="bg-gray-500 w-20 h-8 animate-pulse"></button>
        </div>

        <StaffManagementTable />
      </div>
    </>
  );
};

export default CategoryManagementLS;
