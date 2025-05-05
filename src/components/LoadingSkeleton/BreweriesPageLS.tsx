import React from "react";

type Props = {};

const BreweriesPageLS = (props: Props) => {
  return (
    <section className="w-full h-screen py-3 sm:p-8">
      <div className="flex flex-col justify-center mx-auto text-center gap-6">
        <div className="flex justify-between md:p-5 ">
          <div className="flex flex-col w-fit mx-auto lg:m-0 lg:my-auto ">
            {/* Title Skeleton */}
            <div className="h-8 w-32 bg-gray-300 animate-pulse rounded"></div>
          </div>
          <div className="hidden lg:flex justify-center items-center gap-2">
            {/* Button Skeleton */}
            <div className="h-10 w-32 bg-gray-300 animate-pulse rounded"></div>
          </div>
        </div>
        <div className="flex flex-col justify-center w-[80%] items-center mx-auto gap-8">
          {/* Repeat skeletons for a number of cards you expect */}
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="category-card flex justify-between items-center w-full md:w-1/2 rounded-xl gap-5 p-5 sm:p-6"
            >
              <div className="h-16 w-16 bg-gray-300 animate-pulse rounded-full"></div>
              <div className="h-14 flex-auto  bg-gray-300 animate-pulse rounded"></div>
            </div>
          ))}
        </div>
        <div className="fixed right-5 bottom-10 p-1 z-2 lg:hidden ">
          {/* Floating Button Skeleton */}
          <div className="h-12 w-12 bg-gray-300 animate-pulse rounded-full"></div>
        </div>
      </div>
    </section>
  );
};

export default BreweriesPageLS;
