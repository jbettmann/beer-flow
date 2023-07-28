"use client";
import React, { useState } from "react";
import Invite from "./Invite";

const MultipleInvites = () => {
  const [invitees, setInvitees] = useState([{ email: "", admin: false }]);

  const addInvitee = () => {
    setInvitees([...invitees, { email: "", admin: false }]);
  };

  const removeInvitee = (indexToRemove: number) => {
    setInvitees(invitees.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log(invitees);
    // Call the API to send invites
  };

  const handleChange = (
    index: number,
    field: string,
    value: string | boolean
  ) => {
    const newInvitees = [...invitees];
    newInvitees[index][field] = value;
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
