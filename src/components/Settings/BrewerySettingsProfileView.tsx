"use client";
import getSingleBrewery from "@/lib/getSingleBrewery";
import { getInitials } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useState } from "react";
import useSWR from "swr";
import ImageDisplay from "../ImageDisplay/ImageDisplay";
import { MoveLeft } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
  breweryId: string;
};

const BrewerySettingsProfileView = ({ breweryId }: Props) => {
  const { data: session } = useSession();
  const router = useRouter();
  const { data: brewery, error: breweryError } = useSWR(
    [
      `https://beer-bible-api.vercel.app/breweries/${breweryId}`,
      session?.user.accessToken,
    ],
    getSingleBrewery
  );

  const [owner, setOwner] = useState<boolean>(
    brewery?.owner?._id === session?.user.id
  );

  return (
    brewery && (
      <div>
        <MoveLeft
          size={24}
          strokeWidth={1}
          onClick={() => router.back()}
          className="hover:cursor-pointer"
        />
        <div className="flex flex-col items-center">
          {brewery?.image ? (
            <ImageDisplay item={brewery} className="logo" />
          ) : (
            brewery?.companyName && (
              <div className="logo logo__default ">
                {getInitials(brewery.companyName || "")}
              </div>
            )
          )}
          <h3>{brewery.companyName}</h3>
        </div>
      </div>
    )
  );
};

export default BrewerySettingsProfileView;
