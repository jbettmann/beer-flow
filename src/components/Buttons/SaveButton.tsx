import React, { MouseEventHandler } from "react";
import { Button } from "../ui/button";

type Props = {
  title?: string;
  isLoading: boolean;
  onClick?: (e: any) => void;
  className?: string;
  disabled?: boolean | undefined;
  type?: "button" | "submit" | "reset" | undefined;
  variant?:
    | "default"
    | "secondary"
    | "destructive"
    | "ghost"
    | "link"
    | "outline"
    | null
    | undefined;
};

const SaveButton = ({
  title = "Save",
  isLoading,
  onClick,
  className = "",
  disabled,
  type = "button",
  variant = "default",
}: Props) => {
  return (
    <Button
      variant={variant}
      disabled={disabled || undefined}
      className={` ${className}`}
      onClick={onClick}
      type={type}
    >
      {isLoading ? <span className="loading loading-spinner"></span> : title}
    </Button>
  );
};

export default SaveButton;
