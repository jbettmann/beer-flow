"use client";
import { Beer } from "@/app/types/beer";
import { Brewery } from "@/app/types/brewery";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import Image from "next/image";

const ImageDisplay = ({
  item,
  className,
}: {
  item: Beer | Brewery;
  className: string;
}) => {
  const [imageUrl, setImageUrl] = useState<string | undefined>("");

  const getImagePath = (image: string) => {
    if (image) {
      console.log(image);
      const { data } = supabase.storage.from("Images").getPublicUrl(image);

      if (!data) {
        console.error("Error fetching image URL: ", data);
        return "";
      }
      console.log(data.publicUrl);
      return data.publicUrl;
    }
  };
  useEffect(() => {
    async function fetchUrl() {
      const url = await getImagePath(item.image);
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
