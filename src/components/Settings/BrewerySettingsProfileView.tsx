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
import { useBreweryContext } from "@/context/brewery-beer";
import removeBreweryFromUser from "@/lib/DELETE/removeBreweryFromUser";

type Props = {
  breweryId: string;
};

const BrewerySettingsProfileView = ({ breweryId }: Props) => {
  const { data: session, update } = useSession();
  const router = useRouter();
  const { selectedBrewery, setSelectedBrewery } = useBreweryContext();
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
  const [buttonLoading, setButtonLoading] = useState<string | null>(null);

  const handleStaffMemberClick = () => {
    setSelectedBrewery(brewery);
    router.push(`/breweries/${breweryId}/staff`);
  };

  const handleRemoveAccess = async (buttonLoadingName: string) => {
    // Set isLoading to true to show loading indicator
    setButtonLoading(buttonLoadingName);

    try {
      await removeBreweryFromUser({
        breweryId,
        userId: session?.user.id,
        accessToken: session?.user.accessToken,
      });

      await update({ removeBreweryId: breweryId });
      // Alert the user after successfully removing the brewery
      alert("Brewery successfully removed");
      router.push("/settings/breweries");
    } catch (error) {
      // Handle any errors by showing a message to the user
      alert(error.message);
      console.error(error);
    } finally {
      // Set isLoading back to false once operation is complete
      setButtonLoading(null);
      if (breweryId === selectedBrewery?._id) {
        localStorage.setItem("selectedBreweryId", session?.user.breweries[0]);
      }
    }
  };

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
              <button
                onClick={handleStaffMemberClick}
                className="badge badge-ghost"
              >
                {brewery.staff?.length + 1} Staff Members
              </button>
            ) : (
              <div className="badge badge-ghost">
                {brewery.staff?.length + 1} Staff Members
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
                  onClick={() => handleRemoveAccess("transfer-ownership")}
                  buttonClassName="btn btn-success btn-outline"
                  title="Transfer Ownership"
                  description={`Transfer your ownership to another staff member.`}
                  descriptionClassName="delete-remove-btn__text"
                  buttonId="transfer-ownership"
                  isLoading={buttonLoading}
                />
                {/* Delete Brewery */}
                <DeleteOrRemoveButton
                  icon={<Trash2 strokeWidth={2} />}
                  onClick={() => handleRemoveAccess("delete-brewery")}
                  buttonClassName="btn btn-error btn-outline"
                  title="Delete Brewery"
                  description={`This will permanently delete brewery`}
                  descriptionClassName="delete-remove-btn__text"
                  buttonId="delete-brewery"
                  isLoading={buttonLoading}
                />
              </>
            ) : (
              <DeleteOrRemoveButton
                onClick={() => handleRemoveAccess("remove-access")}
                buttonClassName="btn btn-error btn-outline"
                title="Remove Access"
                description={` Remove
                ${
                  brewery ? brewery.companyName : "this brewery"
                } from breweries.`}
                descriptionClassName="delete-remove-btn__text"
                buttonId="remove-access"
                isLoading={buttonLoading}
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
