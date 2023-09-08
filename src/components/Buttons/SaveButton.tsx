import React, { MouseEventHandler } from "react";

type Props = {
  isLoading: boolean;
  onClick?: (e: Event) => void;
  className?: string;
};

const SaveButton = ({ isLoading, onClick, className }: Props) => {
  return (
    <button className={className ? className : "create-btn"} onClick={onClick}>
      {isLoading ? (
        <span className="loading loading-spinner text-accent"></span>
      ) : (
        "Save"
      )}
    </button>
  );
};

export default SaveButton;
