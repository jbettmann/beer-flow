import React from "react";

type Props = {};

const LoginPageSkeleton = (props: Props) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 shadow-md rounded-lg space-y-6 animate-pulse">
        <div className="h-6 bg-gray-300 rounded w-3/4 mx-auto" />

        <div className="space-y-4">
          <div>
            <div className="h-4 bg-gray-300 rounded w-1/3 mb-2" />
            <div className="h-10 bg-gray-200 rounded w-full" />
          </div>

          <div>
            <div className="h-4 bg-gray-300 rounded w-1/3 mb-2" />
            <div className="h-10 bg-gray-200 rounded w-full" />
          </div>

          <div className="h-10 bg-gray-300 rounded w-full mt-4" />
        </div>

        <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mt-6" />
      </div>
    </div>
  );
};

export default LoginPageSkeleton;
