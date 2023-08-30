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
};

const DeleteOrRemoveButton = ({
  icon,
  onClick,
  title,
  description,
  buttonClassName,
  descriptionClassName,
}: Props) => {
  return (
    <div>
      <button onClick={onClick} className={buttonClassName}>
        {icon}
        {title}
      </button>
      <p className={descriptionClassName}>{description}</p>
    </div>
  );
};

export default DeleteOrRemoveButton;
