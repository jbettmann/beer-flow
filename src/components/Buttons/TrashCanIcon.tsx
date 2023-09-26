import { Trash } from "lucide-react";
import React from "react";

type Props = {
  onClick: (e: any) => void;
  isLoading?: boolean;
  title?: string | undefined;
};

const TrashCanIcon = ({ onClick, isLoading }: Props) => {
  return (
    <button
      className="btn btn-circle btn-ghost hover:bg-error"
      onClick={onClick}
    >
      {isLoading ? (
        <span className="loading loading-spinner "></span>
      ) : (
        <Trash size={24} strokeWidth={1} />
      )}
    </button>
  );
};

export default TrashCanIcon;
