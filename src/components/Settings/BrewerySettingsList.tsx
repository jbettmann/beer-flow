import { Brewery } from "@/types/brewery";
import { getBreweryMemberId, getBreweryMemberIds } from "@/lib/brewery-members";
import ImageDisplay from "@/components/ImageDisplay/ImageDisplay";
import { getInitials } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { Session } from "next-auth";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

type Props = {
  brewery: Brewery;
  session: Session;
};

const BrewerySettingsList = ({ brewery, session }: Props) => {
  const owner = session?.user.id === getBreweryMemberId(brewery.owner);
  const adminIds = new Set(getBreweryMemberIds(brewery.admin));
  const role = owner
    ? "Owner"
    : adminIds.has(session?.user.id)
      ? "Admin"
      : "Crew";
  return (
    <Link
      href={`/settings/breweries/${brewery._id}`}
      key={brewery._id}
      className="group flex min-h-20 w-full items-center justify-between gap-3 rounded-lg border p-4 transition-colors hover:border-primary/40 hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex min-w-0 items-center gap-3">
        {brewery?.image ? (
          <ImageDisplay item={brewery} className="logo w-12 h-12" />
        ) : (
          brewery?.companyName && (
            <div className=" logo__default p-2!">
              {getInitials(brewery.companyName || "")}
            </div>
          )
        )}
        <div className="min-w-0">
          <p className="truncate font-medium">{brewery.companyName}</p>
          <Badge variant="secondary" className="mt-1">{role}</Badge>
        </div>
      </div>
      <ChevronRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
    </Link>
  );
};

export default BrewerySettingsList;
