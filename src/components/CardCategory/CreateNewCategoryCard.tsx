import { BookMarked, LayoutGrid } from "lucide-react";
import React from "react";
import BeerMugBadge from "../Badges/BeerMugBadge";

type Props = {
  handleSaveNewCategory: (categoryName: string) => void;
  setCreateNewCategory: (creatingNewCategory: boolean) => void;
};

const CreateNewCategoryCard = ({
  setCreateNewCategory,
  handleSaveNewCategory,
}: Props) => {
  //  Runs name change save on keydown "Enter"
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      const target = event.target as HTMLInputElement;
      handleSaveNewCategory(target.value);
      event.preventDefault(); // To prevent any default behavior, e.g., form submission
    }
  };
  return (
    <div
      className={`card category-card h-44 py-8 relative border border-primary border-opacity-50 `}
    >
      <div className="flex justify-between items-center p-6 ">
        <label className=" ">
          <LayoutGrid size={28} strokeWidth={1} className="fill-primary " />
        </label>

        <div className=" ">
          <input
            type="text"
            className="input font-semibold "
            autoFocus
            placeholder="Category name"
            onBlur={(e) => handleSaveNewCategory(e.target.value)}
            onKeyDown={(e) => handleKeyPress((e.target as any).value)}
          />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 p-6">
        <button
          className="btn btn-error btn-xs  opacity-70 " // Made the button more visible
          onClick={() => setCreateNewCategory(false)}
        >
          Cancel
        </button>
      </div>
      <div className="absolute bottom-0 right-0 p-6">
        <button className="btn btn-accent btn-xs  opacity-70">Save</button>
      </div>

      {/* Optional: Tooltip */}
      <div
        className="tooltip tooltip-right tooltip-accent"
        data-tooltip="Click to add new category"
      ></div>
    </div>
  );
};

export default CreateNewCategoryCard;
