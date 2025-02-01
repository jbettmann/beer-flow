"use client";
import DefaultBeerImage from "../../assets/img/beer.png";
import { getImagePublicURL } from "@/lib/utils";
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
    null
  );

  useEffect(() => {
    async function fetchUrl() {
      console.log(item.image);
      if (item.image === null || undefined) {
        setImageUrl(DefaultBeerImage);
      } else {
        const url = getImagePublicURL(item.image);
        if (url) {
          setImageUrl(url);
        }
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
