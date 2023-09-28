import React, { MouseEventHandler } from "react";

type Props = {
  isLoading: boolean;
  onClick?: (e: any) => void;
  className?: string;
  disabled?: boolean | undefined;
};

const SaveButton = ({
  isLoading,
  onClick,
  className = "",
  disabled,
}: Props) => {
  return (
    <button
      disabled={disabled || undefined}
      className={`create-btn ${className}`}
      onClick={onClick}
    >
      {isLoading ? <span className="loading loading-spinner"></span> : "Save"}
    </button>
  );
};

export default SaveButton;
