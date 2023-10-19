import BackArrow from "@/components/Buttons/BackArrow";
import React from "react";

type Props = {
  children: React.ReactNode;
};

const layout = ({ children }: Props) => {
  return (
    <div className="lg:w-10/12 mx-auto">
      {/* @ts-expect-error Server component */}
      <BackArrow />
      {children}
    </div>
  );
};

export default layout;
