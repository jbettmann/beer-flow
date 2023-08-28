import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import DeleteAccount from "@/components/Settings/DeleteAccount";
import { getServerSession } from "next-auth/next";
import React from "react";
import Image from "next/image";
import getBreweries from "@/lib/getBreweries";
import { Brewery } from "@/app/types/brewery";
import Link from "next/link";
import ImageDisplay from "@/components/ImageDisplay/ImageDisplay";
import { getInitials } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { Session } from "next-auth";

type Props = {
  brewery: Brewery;
  session: Session;
};

const BrewerySettingsList = ({ brewery, session }: Props) => {
  const owner = session?.user.id === brewery?.owner?._id;
  const adminIds = new Set(brewery?.admin.map((admin) => admin._id));
  const role = owner
    ? "Owner"
    : adminIds.has(session?.user.id)
    ? "Admin"
    : "Crew";
  return (
    <Link
      href={`/settings/breweries/${brewery._id}`}
      key={brewery._id}
      className="flex items-center justify-between p-6"
    >
      <div className="flex items-center">
        {brewery?.image ? (
          <ImageDisplay item={brewery} className="logo" />
        ) : (
          brewery?.companyName && (
            <div className="logo logo__default ">
              {getInitials(brewery.companyName || "")}
            </div>
          )
        )}
        <div>
          <p className="my-1">{brewery.companyName}</p>
          <p className="text-sm opacity-50 my-0">{role}</p>
        </div>
      </div>
      <ChevronRight size={24} strokeWidth={1} />
    </Link>
  );
};

export default BrewerySettingsList;
