"use client";
import { useBreweryContext } from "@/context/brewery-beer";
import { ChevronLeft, MoveLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

type Props = {};

const BackArrow = (props: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const { selectedBrewery } = useBreweryContext();

  const [homepage, setHomepage] = useState<string | null>(null);
  const handleBack = () => {
    router.back();
  };

  useEffect(() => {
    if (selectedBrewery) {
      setHomepage(`/dashboard/breweries/${selectedBrewery?._id}`);
    }
  }, [selectedBrewery?._id]);

  return (
    homepage && (
      <h2
        onClick={handleBack}
        className={`${
          homepage === pathname ? "hidden" : "block my-2 sm:my-4 md:hidden"
        }`}
      >
        <ChevronLeft size={30} />
      </h2>
    )
  );
};

export default BackArrow;
