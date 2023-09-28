"use client";
import React, { useState } from "react";
import Invite from "./Invite";
import { sendInvite } from "@/lib/POST/sendInvite";
import { validateEmail } from "@/lib/validators/email";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useBreweryContext } from "@/context/brewery-beer";
import { Plus, X } from "lucide-react";
import { useToast } from "@/context/toast";
import { set } from "mongoose";

type pageProps = {
  breweryId: string;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const MultipleInvites = ({ breweryId, setIsOpen }: pageProps) => {
  const { data: session } = useSession();
  const router = useRouter();
  const { addToast } = useToast();
  const [invitees, setInvitees] = useState([
    { email: "", isAdmin: false, error: "" },
  ]);
  const { selectedBrewery } = useBreweryContext();

  const addInvitee = () => {
    setInvitees([...invitees, { email: "", isAdmin: false, error: "" }]);
  };

  const removeInvitee = (indexToRemove: number) => {
    setInvitees(invitees.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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
              successEmails.length > 1 ? "invitations" : "invitation"
            } were successfully sent`,
            "success"
          );

          setInvitees([{ email: "", isAdmin: false, error: "" }]);
          router.back();
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

    // If there's an error and the field is email, clear the error
    if (field === "email" && newInvitees[index].error) {
      newInvitees[index].error = "";
    }
    setInvitees(newInvitees);
  };

  return (
    <>
      <div className="flex w-full justify-between items-center">
        <button onClick={onClose} className="btn btn-ghost m-2 ">
          <X size={24} />
        </button>
        <h3>Invite</h3>
        <button
          onClick={onClose}
          className="btn btn-ghost btn-disabled invisible m-2 "
        >
          <X size={24} />
        </button>
      </div>

      {selectedBrewery && (
        <form
          onSubmit={handleSubmit}
          className="form flex flex-col w-full lg:w-1/2 mt-8 rounded-lg mx-auto"
        >
          <div className="flex flex-col items-center">
            <div className="flex justify-between">
              <div className="flex flex-col ">
                {invitees.map((invitee, index) => (
                  <div className="p-3 flex items-center" key={index}>
                    {index !== 0 ? (
                      <button
                        type="button"
                        className="btn btn-outline btn-error rounded-full w-5 h-9 min-w-0 min-h-fit mr-3"
                        onClick={() => removeInvitee(index)}
                      >
                        -
                      </button>
                    ) : (
                      <div className="w-10 h-9 min-w-9 min-h-fit mr-3"></div>
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
                <div className="flex justify-end items-center pr-6 gap-2">
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

            <button className="create-btn inverse mx-auto mt-10" type="submit">
              Send Invites
            </button>
          </div>
        </form>
      )}
    </>
  );
};

export default MultipleInvites;
