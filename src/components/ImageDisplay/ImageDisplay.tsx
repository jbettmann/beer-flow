"use client";
import { getImagePublicURL } from "@/lib/supabase/getImage";
import DefaultBeerImage from "../../assets/img/beer.png";

import Image, { StaticImageData } from "next/image";
import { useEffect, useState } from "react";

const ImageDisplay = ({
  item,
  className,
}: {
  item: any;
  className: string;
}) => {
  const [imageUrl, setImageUrl] = useState<string | null | StaticImageData>(
    item.image ? item.image : null
  );

  useEffect(() => {
    async function fetchUrl() {
      if (item.image === null || undefined) {
        setImageUrl(DefaultBeerImage);
      } else {
        setImageUrl(item.image);
      }
    }

    fetchUrl();
  }, [item.image]);

  return (
    <Image
      src={imageUrl ? imageUrl : DefaultBeerImage}
      className={className}
      alt={item.name ? item.name : item.companyName}
      width={50}
      height={50}
    />
  );
};

export default ImageDisplay;
