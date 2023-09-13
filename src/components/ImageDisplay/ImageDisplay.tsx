"use client";
import { Beer } from "@/app/types/beer";
import { Brewery } from "@/app/types/brewery";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getImagePublicURL } from "@/lib/utils";

const ImageDisplay = ({
  item,
  className,
}: {
  item: Beer | Brewery;
  className: string;
}) => {
  const [imageUrl, setImageUrl] = useState<string | undefined>("");

  useEffect(() => {
    async function fetchUrl() {
      const url = getImagePublicURL(item.image);
      setImageUrl(url);
    }

    fetchUrl();
  }, [item.image]);

  return (
    <Image
      src={imageUrl}
      className={className}
      alt={item.name ? item.name : item.companyName}
      width={50}
      height={50}
    />
  );
};

export default ImageDisplay;
