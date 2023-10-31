"use client";
import { LucideIcon } from "lucide-react";
import React, { ReactNode, ReactSVG } from "react";

type Props = {
  icon?: ReactNode;
  onClick: () => void;
  title: string;
  description: string;
  buttonClassName: string;
  descriptionClassName: string;
  buttonId?: string;
  isLoading?: boolean | string | null;
};

const DeleteOrRemoveButton = ({
  icon,
  onClick,
  title,
  description,
  buttonClassName,
  descriptionClassName,
  isLoading,
  buttonId,
}: Props) => {
  const isThisButtonLoading = isLoading === true || isLoading === buttonId;
  return (
    <div className="flex flex-col">
      <button onClick={onClick} className={buttonClassName}>
        {isThisButtonLoading ? (
          <span className="loading loading-spinner text-primary"></span>
        ) : (
          <>
            {icon}
            {title}
          </>
        )}
      </button>
      <p className={descriptionClassName}>{description}</p>
    </div>
  );
};

export default DeleteOrRemoveButton;
