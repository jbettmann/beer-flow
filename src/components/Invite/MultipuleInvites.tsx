"use client";
import React, { useEffect, useState } from "react";
import Invite from "./Invite";
import { sendInvite } from "@/lib/POST/sendInvite";
import { validateEmail } from "@/lib/validators/email";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useBreweryContext } from "@/context/brewery-beer";
import { Plus, Send, X } from "lucide-react";
import { useToast } from "@/context/toast";
import { set } from "mongoose";

type pageProps = {
  breweryId: string;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const MultipleInvites = ({ breweryId, setIsOpen }: pageProps) => {
  const { data: session } = useSession();
  const { addToast } = useToast();
  const [invitees, setInvitees] = useState([
    { email: "", isAdmin: false, error: "" },
  ]);
  const [hasStartedInvite, setHasStartedInvite] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { selectedBrewery, isAdmin } = useBreweryContext();

  const addInvitee = () => {
    setInvitees([...invitees, { email: "", isAdmin: false, error: "" }]);
  };

  const removeInvitee = (indexToRemove: number) => {
    setInvitees(invitees.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    // validate email addresses and set errors if necessary
    const newInvitees = invitees.map((invitee) => {
      if (!invitee.email || !validateEmail(invitee.email)) {
        return {
          ...invitee,
          error: "Invalid email address.",
        };
      }

      return invitee;
    });

    // If any errors, update the state and return
    if (newInvitees.some((invitee) => invitee.error)) {
      setInvitees(newInvitees);
      return;
    }

    // waits for all the promises to settle.
    // Returns an array of objects, where each
    // object describes the outcome of each promise
    try {
      if (session?.user.accessToken) {
        const results = await Promise.allSettled(
          invitees.map((invitee) =>
            sendInvite({
              inviteData: invitee,
              breweryId,
              accessToken: session?.user.accessToken,
            })
          )
        );

        const successEmails = results
          .filter((result) => result.status === "fulfilled")
          .map((result, index) => invitees[index].email);
        const failedEmails = results
          .filter((result) => result.status === "rejected")
          .map((result, index) => invitees[index].email);

        if (successEmails.length) {
          addToast(
            `${successEmails.join(", ")} ${
              successEmails.length > 1 ? "invitations were" : "invitation was"
            } successfully sent`,
            "success"
          );

          setInvitees([{ email: "", isAdmin: false, error: "" }]);
        }
        if (failedEmails.length) {
          addToast(
            `Failed to send invitation to: ${failedEmails.join(", ")}`,
            "error"
          );
        }
      }
      onClose();
    } catch (error: string | any) {
      addToast(error.message, "error");
      console.error("Error sending invites:", error);
    }
    setIsLoading(false);
  };

  const onClose = () => {
    setIsOpen(false);
    setInvitees([{ email: "", isAdmin: false, error: "" }]);
  };

  const handleChange = (
    index: number,
    field: string,
    value: string | boolean
  ) => {
    const newInvitees: any = [...invitees];
    newInvitees[index][field] = value;

    if (field === "email") {
      if (value === "") {
        newInvitees[index].error = "Email address required to send invite";
        setHasStartedInvite(false);
      } else {
        newInvitees[index].error = "";
        setHasStartedInvite(true);
      }
    }

    setInvitees(newInvitees);
  };

  return (
    <div>
      {selectedBrewery && (
        <form
          onSubmit={handleSubmit}
          className="py-4 flex flex-col justify-between mx-auto rounded-lg text-white lg:p-0"
        >
          <div className="flex w-full justify-between items-center p-3 pt-0 lg:hidden">
            <button onClick={onClose} className="btn btn-ghost " type="button">
              <X size={24} />
            </button>
            <h3>Invite</h3>
            <button
              aria-label="Send Invites"
              className=" text-background px-4 "
              type="submit"
              disabled={
                !hasStartedInvite ||
                invitees.some((invitee) => !invitee.email || invitee.error)
              }
            >
              {isLoading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                <Send size={25} />
              )}
            </button>
          </div>
          <div className="flex justify-between">
            <div className="flex flex-col ">
              {invitees.map((invitee, index) => (
                <div
                  className={`p-3 flex flex-col xxs:flex-row xxs:items-center relative animate-appear `}
                  key={index}
                >
                  {index !== 0 ? (
                    <button
                      type="button"
                      className="btn-link link-error no-underline absolute bottom-2 ml-5 xxs:ml-0 xxs:mt-3 xxs:relative  xxs:btn xxs:btn-outline xxs:text-error xxs:rounded-full xxs:w-6 xxs:h-9 xxs:min-w-0 xxs:min-h-fit mr-3"
                      onClick={() => removeInvitee(index)}
                    >
                      <span className="hidden xxs:flex ">-</span>
                      <span className="xxs:hidden text-sm">Remove</span>
                    </button>
                  ) : (
                    <div className=" w-9 h-9 min-w-5 min-h-fit mr-3"></div>
                  )}
                  <Invite
                    invitee={invitee}
                    className={""}
                    handleChange={(field, value) =>
                      handleChange(index, field, value)
                    }
                    error={invitee.error}
                  />
                </div>
              ))}
              <div className="flex justify-end  items-center pr-6 gap-2">
                <button
                  type="button"
                  className="create-btn inverse"
                  onClick={addInvitee}
                >
                  <Plus size={18} strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>

          <div className=" hidden lg:flex justify-between items-center w-3/4 p-3 mt-6 pb-0 mx-auto">
            <button
              className="btn border-none bg-transparent hover:bg-background hover:text-primary text-background"
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>

            {isAdmin && (
              <button
                className="create-btn inverse"
                type="submit"
                disabled={
                  !hasStartedInvite ||
                  invitees.some((invitee) => !invitee.email || invitee.error)
                }
              >
                {isLoading ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  <>
                    <Send size={25} /> Invite
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
};

export default MultipleInvites;
