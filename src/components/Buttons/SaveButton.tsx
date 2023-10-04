import React, { MouseEventHandler } from "react";

type Props = {
  title?: string;
  isLoading: boolean;
  onClick?: (e: any) => void;
  className?: string;
  disabled?: boolean | undefined;
  type?: "button" | "submit" | "reset" | undefined;
};

const SaveButton = ({
  title = "Save",
  isLoading,
  onClick,
  className = "",
  disabled,
  type = "button",
}: Props) => {
  return (
    <button
      disabled={disabled || undefined}
      className={`create-btn ${className}`}
      onClick={onClick}
      type={type}
    >
      {isLoading ? <span className="loading loading-spinner"></span> : title}
    </button>
  );
};

export default SaveButton;
