"use client";
import getSingleBrewery from "@/lib/getSingleBrewery";
import { getInitials } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import useSWR from "swr";
import ImageDisplay from "../ImageDisplay/ImageDisplay";
import { Divide, MoveLeft, PencilLine, Repeat2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import RemoveAccess from "../Buttons/RemoveAccess";
import { Users } from "@/app/types/users";
import BottomDrawer from "../BottomDrawer/BottomDrawer";
import EditBreweryProfile from "./EditBreweryProfile";
import DeleteOrRemoveButton from "../Buttons/DeleteOrRemoveButton";

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

  const [admin, setAdmin] = useState<boolean>(
    new Set(brewery?.admin?.map((admin: Users) => admin._id)).has(
      session?.user.id
    )
  );

  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    if (brewery) {
      setOwner(brewery?.owner?._id === session?.user.id);

      setAdmin(
        new Set(brewery?.admin?.map((admin: Users) => admin._id)).has(
          session?.user.id
        )
      );
    }
  }, [brewery, session?.user]);

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
            <ImageDisplay item={brewery} className="logo__settings" />
          ) : (
            brewery?.companyName && (
              <div className="logo logo__default ">
                {getInitials(brewery.companyName || "")}
              </div>
            )
          )}

          <h3 className="mt-5">{brewery.companyName}</h3>

          <div>
            <p className="badge badge-ghost">
              Owner {owner ? "You" : brewery.owner.fullName}
            </p>
            {owner || admin ? (
              <Link
                href={`/breweries/${brewery._id}/staff`}
                className="badge badge-ghost"
              >
                {brewery.staff?.length} Staff Members
              </Link>
            ) : (
              <div className="badge badge-ghost">
                {brewery.staff?.length} Staff Members
              </div>
            )}
          </div>

          {owner && (
            <div
              onClick={() => setIsOpen(true)}
              className="btn w-full md:w-1/4"
            >
              <PencilLine size={24} />
              Edit
            </div>
          )}
          <div className="divider"></div>

          <div className={`text-center ${owner ? "flex" : ""}`}>
            {owner ? (
              <>
                {/* Transfer Ownership */}
                <DeleteOrRemoveButton
                  icon={<Repeat2 />}
                  onClick={() => console.log("Transfer Ownership")}
                  buttonClassName="btn btn-success btn-outline"
                  title="Transfer Ownership"
                  description={`Transfer your ownership to another staff member.`}
                  descriptionClassName="delete-remove-btn__text"
                />
                {/* Transfer Ownership */}
                <DeleteOrRemoveButton
                  icon={<Trash2 strokeWidth={2} />}
                  onClick={() => console.log("Delete Brewery")}
                  buttonClassName="btn btn-error btn-outline"
                  title="Delete Brewery"
                  description={`This will permanently delete brewery`}
                  descriptionClassName="delete-remove-btn__text"
                />
              </>
            ) : (
              <DeleteOrRemoveButton
                onClick={() => console.log("Remove Access")}
                buttonClassName="btn btn-error btn-outline"
                title="Remove Access"
                description={` This will remove your access to 
                ${brewery ? brewery.companyName : "this brewery"}.`}
                descriptionClassName="mx-1 text-sm opacity-50"
              />
            )}
          </div>
        </div>
        <BottomDrawer isOpen={isOpen}>
          <EditBreweryProfile onClose={() => setIsOpen(false)} />
        </BottomDrawer>
      </div>
    )
  );
};

export default BrewerySettingsProfileView;
