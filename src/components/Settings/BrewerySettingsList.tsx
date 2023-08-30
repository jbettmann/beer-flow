import { Brewery } from "@/app/types/brewery";
import ImageDisplay from "@/components/ImageDisplay/ImageDisplay";
import { getInitials } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { Session } from "next-auth";
import Link from "next/link";

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
