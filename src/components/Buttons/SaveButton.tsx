import React, { MouseEventHandler } from "react";

type Props = {
  isLoading: boolean;
  onClick?: (e: Event) => void;
};

const SaveButton = ({ isLoading, onClick }: Props) => {
  return (
    <button className="create-btn" onClick={onClick}>
      {isLoading ? (
        <span className="loading loading-spinner text-accent"></span>
      ) : (
        "Save"
      )}
    </button>
  );
};

export default SaveButton;
