import { BookMarked, LayoutGrid } from "lucide-react";
import React, { useState } from "react";
import BeerMugBadge from "../Badges/BeerMugBadge";
import SaveButton from "../Buttons/SaveButton";

type Props = {
  handleSaveNewCategory: (categoryName: string) => void;
  setCreateNewCategory: (creatingNewCategory: boolean) => void;
  isLoading: boolean;
};

const CreateNewCategoryCard = ({
  setCreateNewCategory,
  handleSaveNewCategory,
  isLoading,
}: Props) => {
  const [inputValue, setInputValue] = useState<string>("");
  //  Runs name change save on keydown "Enter"
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSaveNewCategory(inputValue);
      event.preventDefault(); // To prevent any default behavior, e.g., form submission
    }
  };
  return (
    <div className={`card new-category h-fit py-8 px-6`}>
      <div className="flex gap-3 items-center py-6 ">
        <label className=" ">
          <LayoutGrid size={28} strokeWidth={1} />
        </label>

        <div className=" ">
          <input
            type="text"
            value={inputValue}
            className="input w-full rounded-full border-none font-semibold "
            autoFocus
            placeholder="Category name"
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
          />
        </div>
      </div>
      <div className="flex justify-end items-center gap-3 ">
        <button
          className="btn btn-ghost text-primary " // Made the button more visible
          onClick={() => setCreateNewCategory(false)}
        >
          Cancel
        </button>
        <SaveButton
          isLoading={isLoading}
          disabled={inputValue === "" ? true : false}
          onClick={() => handleSaveNewCategory(inputValue)}
        />
      </div>
    </div>
  );
};

export default CreateNewCategoryCard;
