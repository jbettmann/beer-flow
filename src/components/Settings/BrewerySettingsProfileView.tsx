"use client";
import { Users } from "@/app/types/users";
import { useBreweryContext } from "@/context/brewery-beer";
import { useToast } from "@/context/toast";
import deleteBrewery from "@/lib/DELETE/deleteBrewery";
import removeBreweryFromUser from "@/lib/DELETE/removeBreweryFromUser";
import getSingleBrewery from "@/lib/getSingleBrewery";
import { getInitials } from "@/lib/utils";
import { MoveLeft, PencilLine, Repeat2, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR from "swr";
import AlertDialog from "../Alerts/AlertDialog";
import DeleteOrRemoveButton from "../Buttons/DeleteOrRemoveButton";
import BottomDrawer from "../Drawers/BottomDrawer";
import ImageDisplay from "../ImageDisplay/ImageDisplay";
import EditBreweryProfile from "./EditBreweryProfile";

type Props = {
  breweryId: string;
};

const BrewerySettingsProfileView = ({ breweryId }: Props) => {
  const { data: session, update } = useSession();
  const router = useRouter();
  const { addToast } = useToast();
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

  const [isAccessAlertOpen, setIsAccessAlertOpen] = useState<boolean>(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState<boolean>(false);

  // redirect to brewery staff page
  const handleStaffMemberClick = () => {
    setSelectedBrewery(brewery);
    router.push(`/breweries/${breweryId}/staff`);
  };

  // Deletes Brewery or Removes User Access from Brewery
  const handleAction = async (buttonLoadingName: string) => {
    // Set isLoading to true to show loading indicator
    setButtonLoading(buttonLoadingName);

    try {
      let result;
      const commonProps = {
        breweryId,
        accessToken: session?.user.accessToken,
      };
      // Remove Access
      if (buttonLoadingName === "remove-access") {
        result = await removeBreweryFromUser({
          ...commonProps,
          userId: session?.user.id,
        });
      } else {
        // Delete Brewery
        result = await deleteBrewery(commonProps);
      }
      const updated = await update({ removeBreweryId: breweryId });

      // Alert the user after successfully removing the brewery
      if (result && updated) {
        addToast(result.message, "success");
        router.push("/settings/breweries");

        // If the brewery is the selected brewery, set the selected brewery to the first brewery in the user's breweries array
        if (breweryId === selectedBrewery?._id) {
          if (session?.user.breweries && session?.user.breweries.length > 0) {
            localStorage.setItem(
              "selectedBreweryId",
              session?.user.breweries[0]
            );
            window.dispatchEvent(new CustomEvent("selectedBreweryChanged"));
          } else {
            router.push("/breweries");
          }
        }
        router.refresh();
      }
    } catch (error: any) {
      addToast(error.message, "error");
      console.error(error);
    } finally {
      setButtonLoading(null);
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
        {/* Remove Access Alert */}
        <AlertDialog
          title=""
          isOpen={isAccessAlertOpen}
          onClose={() => setIsAccessAlertOpen(false)}
          onConfirm={() => {
            // Logic to remove access to brewery
            handleAction("remove-access");
            setIsAccessAlertOpen(false);
          }}
          message={
            <>
              Are you sure you want to remove your access to
              <br />
              {brewery.companyName}?
            </>
          }
        />
        {/* Delete Brewery */}
        <AlertDialog
          title=""
          isOpen={isDeleteAlertOpen}
          onClose={() => setIsDeleteAlertOpen(false)}
          onConfirm={() => {
            // Logic to remove access to brewery
            handleAction("delete-brewery");
            setIsDeleteAlertOpen(false);
          }}
          message={
            <>
              Are you sure you want to delete
              <br />
              {brewery.companyName} brewery?
            </>
          }
          confirmButtonText="Delete Brewery"
        />

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
              <div className=" logo__default ">
                {getInitials(brewery.companyName || "")}
              </div>
            )
          )}

          <h3 className="mt-5">{brewery.companyName}</h3>

          <div>
            <p className="badge badge-accent">
              Owner {owner ? "You" : brewery?.owner?.fullName}
            </p>
            {owner || admin ? (
              <button
                onClick={handleStaffMemberClick}
                className="badge badge-accent"
              >
                {brewery.staff?.length + 1} Staff Members
              </button>
            ) : (
              <div className="badge badge-accent">
                {brewery.staff?.length + 1} Staff Members
              </div>
            )}
          </div>

          {owner && (
            <div
              onClick={() => setIsOpen(true)}
              className="create-btn w-full md:w-1/4"
            >
              <PencilLine size={24} strokeWidth={1} />
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
                  onClick={() => console.log("transfer-ownership")}
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
                  onClick={() => setIsDeleteAlertOpen(true)}
                  buttonClassName="btn btn-error btn-outline"
                  title="Delete Brewery"
                  description={`This will permanently delete this brewery and all of its data.`}
                  descriptionClassName="delete-remove-btn__text"
                  buttonId="delete-brewery"
                  isLoading={buttonLoading}
                />
              </>
            ) : (
              <DeleteOrRemoveButton
                onClick={() => setIsAccessAlertOpen(true)}
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
          <EditBreweryProfile
            brewery={brewery}
            onClose={() => setIsOpen(false)}
          />
        </BottomDrawer>
      </div>
    )
  );
};

export default BrewerySettingsProfileView;
