import React from "react";
import BeerMug from "@/assets/beer-mug.svg";
import Image from "next/image";

type Props = {
  beerCount: number;
  className?: string;
};

const BeerMugBadge = ({ beerCount, className }: Props) => {
  return (
    <div
      className={`bg-accent bg-opacity-80 flex justify-center items-center rounded-full p-1 px-2 
        ${className ? className : " h-1/3 "}
     `}
    >
      <p className="text-primary m-0 text-xs font-semibold">{beerCount}</p>
      <Image
        src={BeerMug}
        alt="beer mug badge"
        width={15}
        height={15}
        className=""
      />
    </div>
  );
};

export default BeerMugBadge;
