import React from "react";

type Props = {};

const EditCategoryLS = (props: Props) => (
  <div className="p-4 form flex flex-col justify-between mx-auto rounded-lg shadow-2xl text-white bg-gray-900  animate-pulse">
    <div className="container-create__form mb-4  ">
      <div className="h-4 bg-gray-300 w-1/4 mb-2"></div>
      <div className="h-8 bg-gray-200 w-full"></div>
    </div>
    <div className="flex justify-between  ">
      <div className="btn btn-error h-8 bg-gray-300 w-24 mx-2 "></div>

      <div className="btn btn-accent h-8 bg-gray-300 w-24"></div>
    </div>
  </div>
);

export default EditCategoryLS;
