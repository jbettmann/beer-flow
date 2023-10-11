import React from "react";

type Props = {};

const BeerCardLS = (props: Props) => {
  return (
    <div className="p-4 mx-auto rounded-lg h-full shadow-2xl animate-pulse bg-primary overflow-y-auto">
      {/* Main Content */}
      <div className="flex flex-col md:flex-row-reverse justify-between p-3 ">
        {/* Image & Date Skeleton */}
        <div className="flex flex-col items-center justify-between w-full md:w-[45%] h-64 p-2">
          {/* Image */}
          <div className="w-48 h-60  md:w-full bg-gray-300 rounded-xl mb-4"></div>
          {/* Date */}
          <div className="w-full h-6 bg-gray-300 rounded-lg"></div>
        </div>

        {/* Name, Style, ABV Skeleton */}
        <div className="flex flex-col justify-between w-full md:py-7  md:w-1/2 gap-3">
          <div className="w-full h-6 bg-gray-300 rounded-lg"></div>
          <div className="w-full h-6 bg-gray-300 rounded-lg"></div>
          <div className="w-full h-6 bg-gray-300 rounded-lg"></div>
          <div className="w-full h-6 bg-gray-300 rounded-lg"></div>
        </div>
      </div>

      {/* Categories, Hops, Malts */}
      <div className="flex flex-col gap-3 mt-4">
        <div className="w-full h-6 bg-gray-300 rounded-lg"></div>
        <div className="w-full h-6 bg-gray-300 rounded-lg"></div>
        <div className="w-full h-6 bg-gray-300 rounded-lg"></div>
      </div>

      {/* Description, Notes, Name Details */}
      <div className="flex flex-col gap-3 mt-4">
        <div className="w-full h-16 bg-gray-300 rounded-lg"></div>
        <div className="w-full h-16 bg-gray-300 rounded-lg"></div>
        <div className="w-full h-16 bg-gray-300 rounded-lg"></div>
      </div>

      {/* Footer */}
      <div className="flex py-5 px-3 justify-between items-center ">
        {/* Archive */}
        <div className="w-24 h-6 bg-gray-300 rounded-lg"></div>

        {/* Save Button */}
        <div className="w-24 h-8 bg-gray-300 rounded-lg"></div>
      </div>
    </div>
  );
};

export default BeerCardLS;
