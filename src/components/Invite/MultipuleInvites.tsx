"use client";
import React, { useState } from "react";
import Invite from "./Invite";
import { sendInvite } from "@/lib/POST/sendInvite";
import { validateEmail } from "@/lib/validators/email";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type pageProps = {
  breweryId: string;
};

const MultipleInvites = ({ breweryId }: pageProps) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [invitees, setInvitees] = useState([
    { email: "", isAdmin: false, error: "" },
  ]);

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
          alert(
            `${successEmails.join(", ")} invitations were successfully sent`
          );
          setInvitees([{ email: "", isAdmin: false, error: "" }]);
          router.back();
        }
        if (failedEmails.length) {
          alert(`Failed to send invitations to: ${failedEmails.join(", ")}`);
        }
      }
    } catch (error) {
      console.error("Error sending invites:", error);
    }
  };

  const handleChange = (
    index: number,
    field: string,
    value: string | boolean
  ) => {
    const newInvitees = [...invitees];
    newInvitees[index][field] = value;

    // If there's an error and the field is email, clear the error
    if (field === "email" && newInvitees[index].error) {
      newInvitees[index].error = "";
    }
    setInvitees(newInvitees);
  };

  return (
    <>
      <h1>Invite To Brewery</h1>
      <form
        onSubmit={handleSubmit}
        className="form flex flex-col w-1/2 mt-8 p-5 rounded-lg mx-auto"
      >
        <div className="flex justify-between">
          <div className="flex flex-col ">
            {invitees.map((invitee, index) => (
              <div className="py-3 flex" key={index}>
                {index !== 0 && (
                  <button
                    type="button"
                    className="btn btn-outline btn-error mr-3"
                    onClick={() => removeInvitee(index)}
                  >
                    -
                  </button>
                )}
                <Invite
                  invitee={invitee}
                  className={`${index === 0 && "ml-16"} mx-3`}
                  handleChange={(field, value) =>
                    handleChange(index, field, value)
                  }
                  error={invitee.error}
                />
              </div>
            ))}
          </div>
          <button type="button" className="create-btn" onClick={addInvitee}>
            +
          </button>
        </div>
        <button className="create-btn mx-auto" type="submit">
          Send Invites
        </button>
      </form>
    </>
  );
};

export default MultipleInvites;
