"use client";
import DefaultBeerImage from "../../assets/img/beer.png";
import { getImagePublicURL } from "@/lib/utils";
import Image from "next/image";
import { useEffect, useState } from "react";

const ImageDisplay = ({
  item,
  className,
}: {
  item: any;
  className: string;
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>("");

  useEffect(() => {
    async function fetchUrl() {
      const url = getImagePublicURL(item.image);
      if (url) {
        setImageUrl(url);
      } else {
        setImageUrl("/../../assets/img/beer.png");
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
