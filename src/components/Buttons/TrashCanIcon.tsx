import { Trash, Trash2 } from "lucide-react";
import React from "react";

type Props = {
  onClick: (e: any) => void;
  isLoading?: boolean;
  title?: string | undefined;
  className?: string;
};

const TrashCanIcon = ({
  onClick,
  isLoading,
  title = undefined,
  className = "",
}: Props) => {
  return (
    <button
      className={`border-none transition-all duration-150 hover:bg-transparent hover:scale-105 ${className}`}
      onClick={onClick}
      title={title}
    >
      {isLoading ? (
        <span className="loading loading-spinner "></span>
      ) : (
        <Trash2 size={24} strokeWidth={1} />
      )}
    </button>
  );
};

export default TrashCanIcon;
