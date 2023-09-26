import { Trash, Trash2 } from "lucide-react";
import React from "react";

type Props = {
  onClick: (e: any) => void;
  isLoading?: boolean;
  title?: string | undefined;
};

const TrashCanIcon = ({ onClick, isLoading, title = undefined }: Props) => {
  return (
    <button
      className=" border-none hover:bg-transparent hover:text-error"
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
